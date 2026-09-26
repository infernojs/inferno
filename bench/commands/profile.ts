import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { buildApp } from '../apps/build.ts';
import { APPS } from '../apps/registry.ts';
import { type HeadlessMode, resolveBrowser } from '../lib/browsers.ts';
import { buildOptionMatrix } from '../lib/options.ts';
import { cachePath } from '../lib/paths.ts';
import { run, table } from '../lib/util.ts';
import { launchBrowser } from '../runner/launch.ts';
import { identifyRenderer, rendererPids } from '../runner/pmu.ts';
import { PageSession } from '../runner/session.ts';
import { selectWorkloads } from '../runner/workloads.ts';
import { startServer } from '../server/server.ts';
import { ensureVariant } from '../variants/build.ts';
import { parseVariantList } from '../variants/spec.ts';

interface CpuProfileNode {
  id: number;
  callFrame: { functionName: string; url: string; lineNumber: number; columnNumber: number };
  hitCount: number;
  children?: number[];
}

/** Self time per function (url:line) from CDP CPU profiles. */
function aggregateCpuProfiles(profiles: { nodes: CpuProfileNode[]; samples: number[]; timeDeltas: number[] }[]): Map<string, number> {
  const self = new Map<string, number>();
  for (const p of profiles) {
    const byId = new Map(p.nodes.map((n) => [n.id, n]));
    p.samples.forEach((id, i) => {
      const n = byId.get(id)!;
      const f = n.callFrame;
      const where = f.url ? `${f.url.split('/').pop()}:${f.lineNumber + 1}` : '';
      const key = `${f.functionName || '(anonymous)'} ${where}`.trim();
      self.set(key, (self.get(key) ?? 0) + (p.timeDeltas[i] ?? 0) / 1000);
    });
  }
  return self;
}

/** Coarse subsystem of a perf symbol, for a one-line breakdown of where cycles go. */
const CATEGORIES: [RegExp, string][] = [
  [/jitted-|main\.js|^LazyCompile|^JS:|^Function:|^Builtin:|^Handler:|^(?:Baseline|Maglev|Turbofan|Interp)/, 'JS (JIT code)'],
  [/Builtins_|v8::internal::Builtin/, 'V8 builtins'],
  [/v8::internal::(?:Heap|Scavenge|MarkCompact|Sweeper|Minor|Concurrent|Mark|GC|Evacuat)|cppgc::|blink::ThreadState|Oilpan/i, 'GC'],
  [/v8::internal::|v8::/, 'V8 runtime'],
  [/blink::V8|blink::bindings|blink::.*Binding/, 'DOM bindings'],
  [/blink::(?:Style|CSS|.*Style|ComputedStyle|RuleSet|Selector|MatchedProperties|StyleResolver|ElementRuleCollector)/, 'style'],
  [/blink::(?:Layout|NG|LayoutNG|.*Layout|InlineNode|BlockNode|Fragment|PhysicalFragment|ShapeResult|Harfbuzz|Font)|hb_|HarfBuzz/, 'layout/text'],
  [/blink::(?:Paint|.*Painter|DisplayItem|PaintController|PrePaint|PaintLayer|Raster|cc::)|^cc::|Skia|Sk[A-Z]/, 'paint/raster'],
  [/blink::(?:ContainerNode|Node|Element|Document|Text|CharacterData|Attr|DOM|Event|HTML)/, 'DOM'],
  [/partition_alloc|PartitionAlloc|malloc|free|operator new|operator delete/, 'allocator'],
  [/base::|mojo::|content::|IPC::/, 'scheduler/IPC'],
];

function categorize(report: string): { category: string; percent: number }[] {
  const totals = new Map<string, number>();
  for (const line of report.split('\n')) {
    const m = /^\s*([\d.]+)%\s+(\S+)\s+\[.\]\s+(.*)$/.exec(line);
    if (!m) {
      continue;
    }
    const [, pct, dso, sym] = m;
    const subject = `${dso} ${sym}`;
    const cat = CATEGORIES.find(([re]) => re.test(subject))?.[1] ?? 'other';
    totals.set(cat, (totals.get(cat) ?? 0) + Number(pct));
  }
  return [...totals.entries()].map(([category, percent]) => ({ category, percent })).sort((a, b) => b.percent - a.percent);
}

/** CLOCK_MONOTONIC as perf prints it with -k mono (seconds.nanoseconds). */
function monotonic(): string {
  const ns = process.hrtime.bigint();
  return `${ns / 1_000_000_000n}.${String(ns % 1_000_000_000n).padStart(9, '0')}`;
}

/**
 * Native + JS profile of measured ops. Chrome runs under `perf record` (user
 * space cycles, frame-pointer call graphs, jitdump for V8 code). Recording is
 * continuous (pausing perf drops the mmap/comm records of renderers forked
 * meanwhile, leaving them unsymbolized); reports are cut to the exact op
 * windows with --time, using CLOCK_MONOTONIC on both sides. A CDP CPU profile
 * of the same ops gives JS self time per source line.
 */
export default async function profile(argv: string[]): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: {
      variants: { type: 'string' },
      workloads: { type: 'string', default: 'jfb:01_run1k' },
      browser: { type: 'string', default: 'autoexplore' },
      headless: { type: 'string', default: 'new' },
      iters: { type: 'string', default: '20' },
      freq: { type: 'string', default: '20000' },
      minify: { type: 'string', default: 'off' },
      warmup: { type: 'string', default: 'jfb' },
      top: { type: 'string', default: '30' },
    },
  });
  const specs = parseVariantList(values.variants);
  const workloads = selectWorkloads(values.workloads!);
  const headless = values.headless as HeadlessMode;
  const resolved = resolveBrowser(values.browser!, headless);
  const [options] = buildOptionMatrix(undefined, values.minify);
  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const server = await startServer();

  try {
    for (const spec of specs) {
      const variant = await ensureVariant(spec);
      const urls = new Map<string, string>();
      for (const appName of new Set(workloads.map((w) => w.app))) {
        const built = await buildApp(APPS[appName], variant, options);
        urls.set(appName, server.origin + server.mount(built.dir));
      }
      const outDir = cachePath('results', 'profile', runId, spec.id);
      mkdirSync(outDir, { recursive: true });
      const perfData = join(outDir, 'perf.data');
      const launched = await launchBrowser(resolved, {
        headless,
        sandbox: false,
        cwd: outDir,
        jsFlags: ['--perf-prof', '--interpreted-frames-native-stack'],
        wrapper: ['perf', 'record', '-q', '-k', 'mono', '-e', 'cycles:u', '--call-graph', 'fp', '-F', values.freq!, '-o', perfData, '--'],
      });
      const windows: string[] = [];
      const browserCdp = await launched.browser.target().createCDPSession();
      const renderers: number[] = [];
      const cpuProfiles: any[] = [];
      try {
        for (let i = 0; i < Number(values.iters); i++) {
          for (const w of workloads) {
            process.stderr.write(`\r${spec.id} ${i + 1}/${values.iters} ${w.id}`.padEnd(90));
            const before = await rendererPids(browserCdp);
            const s = await PageSession.open(launched.browser, urls.get(w.app)!);
            try {
              const fresh = [...(await rendererPids(browserCdp))].filter((p) => !before.has(p));
              renderers.push(
                await identifyRenderer(fresh, () => s.evaluate('(() => { const end = performance.now() + 30; while (performance.now() < end); })()')),
              );
              const op = await w.init(s, values.warmup !== 'none');
              await s.cdp.send('Profiler.enable');
              await s.cdp.send('Profiler.setSamplingInterval', { interval: 50 });
              const hooks = {
                before: async () => {
                  await s.evaluate('window.gc()');
                  await s.frames(2);
                  await s.cdp.send('Profiler.start');
                },
              };
              let start = '';
              const withStart = { ...hooks, justBefore: async () => void (start = monotonic()) };
              if (op.kind === 'key') {
                await s.measuredKey(op.selector, op.key!, withStart);
              } else {
                await s.measuredClick(op.selector, withStart);
              }
              windows.push(`${start},${monotonic()}`);
              cpuProfiles.push((await s.cdp.send('Profiler.stop')).profile);
            } finally {
              await s.close();
            }
          }
        }
      } finally {
        await launched.close();
        process.stderr.write(`\r${''.padEnd(90)}\r`);
      }

      // Resolve JIT frames, then summarize the renderer main thread.
      const jitData = join(outDir, 'perf.jit.data');
      const hasJitDumps = readdirSync(outDir).some((f) => /^jit-\d+\.dump$/.test(f));
      if (hasJitDumps) {
        await run('perf', ['inject', '--jit', '-i', perfData, '-o', jitData], { cwd: outDir });
      }
      const input = existsSync(jitData) ? jitData : perfData;
      // Renderer main threads have tid == pid (Chrome doesn't rename main threads on Linux).
      const perfReport = (extra: string[]) =>
        execFileSync('perf', ['report', '-i', input, '--tid', renderers.join(','), '--time', windows.join(' '), '--percentage', 'relative', '--no-children', '--stdio', '-q', '-g', 'none', ...extra], {
          cwd: outDir,
          encoding: 'utf8',
          maxBuffer: 1 << 28,
          stdio: ['ignore', 'pipe', 'ignore'],
        });
      const report = perfReport(['--sort', 'dso,sym', '--percent-limit', '0.3']);
      writeFileSync(join(outDir, 'renderer-main.txt'), report);
      const categories = categorize(perfReport(['--sort', 'dso,sym']));
      writeFileSync(join(outDir, 'renderer-main-categories.json'), JSON.stringify(categories, null, 2));
      const js = [...aggregateCpuProfiles(cpuProfiles).entries()].sort((a, b) => b[1] - a[1]);
      writeFileSync(join(outDir, 'cpuprofile-self.json'), JSON.stringify(js, null, 2));

      const top = Number(values.top);
      console.log(`\n=== ${spec.id}: renderer main thread by subsystem (cycles:u) ===`);
      console.log(table(['subsystem', '%'], categories.map((c) => [c.category, c.percent.toFixed(1)])));
      console.log(`\n=== ${spec.id}: renderer main thread, top symbols (cycles:u) ===`);
      console.log(
        report
          .split('\n')
          .filter((l) => l.trim())
          .slice(0, top)
          .join('\n'),
      );
      const total = js.reduce((a, [, v]) => a + v, 0);
      console.log(`\n=== ${spec.id}: JS self time per function (CDP CPU profile, 50 µs) ===`);
      console.log(
        table(
          ['function', 'ms/op', '%'],
          js.slice(0, top).map(([k, v]) => [k.slice(0, 90), (v / cpuProfiles.length).toFixed(3), ((v / total) * 100).toFixed(1)]),
        ),
      );
      console.log(`\nperf data: ${input}\n  open with: hotspot ${input}`);
    }
  } finally {
    await server.close();
  }
  return 0;
}
