import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { buildApp } from '../apps/build.ts';
import { APPS } from '../apps/registry.ts';
import { type HeadlessMode, resolveBrowser } from '../lib/browsers.ts';
import { buildOptionMatrix } from '../lib/options.ts';
import { BENCH_DIR, cachePath } from '../lib/paths.ts';
import { run, table } from '../lib/util.ts';
import { launchBrowser } from '../runner/launch.ts';
import { identifyRenderer, rendererPids } from '../runner/pmu.ts';
import { PageSession } from '../runner/session.ts';
import { selectWorkloads } from '../runner/workloads.ts';
import { startServer } from '../server/server.ts';
import { ensureVariant } from '../variants/build.ts';
import { parseVariantList } from '../variants/spec.ts';

const V8_LOG_FLAGS = ['--log-ic', '--log-maps', '--log-function-events', '--log-deopt', '--log-code'];

interface IcSite {
  site: string;
  fn: string;
  type: string;
  key: string;
  worst: string;
  transitions: number;
}

interface DeoptSite {
  site: string;
  fn: string;
  reason: string;
  type: string;
  count: number;
}

interface JitSummary {
  ics: IcSite[];
  deopts: DeoptSite[];
  mapCount: number;
}

/**
 * V8's system-analyzer keeps module-level state, so every log is summarized in
 * a fresh process (analysis/v8log-worker.ts).
 */
async function summarizeLog(file: string, bundleName: string): Promise<JitSummary> {
  const res = await run(process.execPath, ['--no-warnings', join(BENCH_DIR, 'analysis/v8log-worker.ts'), file, bundleName]);
  return JSON.parse(res.stdout);
}

/**
 * JIT behaviour of measured ops: runs them with V8 IC/map/deopt/code logging
 * and summarizes, for code in the app bundle (unminified by default), the IC
 * sites that went polymorphic/megamorphic and every deoptimization.
 */
export default async function jit(argv: string[]): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: {
      variants: { type: 'string' },
      workloads: { type: 'string', default: 'jfb:*' },
      browser: { type: 'string', default: 'cft-152' },
      headless: { type: 'string', default: 'new' },
      iters: { type: 'string', default: '1' },
      minify: { type: 'string', default: 'off' },
      top: { type: 'string', default: '25' },
    },
  });
  const specs = parseVariantList(values.variants);
  const workloads = selectWorkloads(values.workloads!);
  const headless = values.headless as HeadlessMode;
  const resolved = resolveBrowser(values.browser!, headless);
  const [options] = buildOptionMatrix(undefined, values.minify);
  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const server = await startServer();
  const top = Number(values.top);

  try {
    for (const spec of specs) {
      const variant = await ensureVariant(spec);
      const urls = new Map<string, string>();
      for (const appName of new Set(workloads.map((w) => w.app))) {
        const built = await buildApp(APPS[appName], variant, options);
        urls.set(appName, server.origin + server.mount(built.dir));
      }
      const outDir = cachePath('results', 'jit', runId, spec.id);
      mkdirSync(outDir, { recursive: true });
      const launched = await launchBrowser(resolved, { headless, sandbox: false, cwd: outDir, jsFlags: V8_LOG_FLAGS });
      const browserCdp = await launched.browser.target().createCDPSession();
      const pages: { workload: string; pid: number }[] = [];
      try {
        for (let i = 0; i < Number(values.iters); i++) {
          for (const w of workloads) {
            process.stderr.write(`\r${spec.id} ${i + 1}/${values.iters} ${w.id}`.padEnd(90));
            const before = await rendererPids(browserCdp);
            const s = await PageSession.open(launched.browser, urls.get(w.app)!);
            try {
              const fresh = [...(await rendererPids(browserCdp))].filter((p) => !before.has(p));
              const pid = await identifyRenderer(fresh, () => s.evaluate('(() => { const end = performance.now() + 30; while (performance.now() < end); })()'));
              pages.push({ workload: w.id, pid });
              const op = await w.init(s, true);
              if (op.kind === 'key') {
                await s.measuredKey(op.selector, op.key!);
              } else {
                await s.measuredClick(op.selector);
              }
            } finally {
              await s.close();
            }
          }
        }
      } finally {
        await launched.close();
        process.stderr.write(`\r${''.padEnd(90)}\r`);
      }

      // Merge per-page summaries (each page is its own renderer and log).
      const logs = readdirSync(outDir).filter((f) => f.endsWith('-v8.log'));
      const icRows = new Map<string, IcSite & { pages: number }>();
      const deoptRows = new Map<string, DeoptSite>();
      let maps = 0;
      for (const page of pages) {
        const file = logs.find((f) => f.endsWith(`-${page.pid}-v8.log`));
        if (!file) {
          continue;
        }
        const sum = await summarizeLog(join(outDir, file), 'main.js');
        maps += sum.mapCount;
        for (const ic of sum.ics) {
          const k = `${ic.site}\0${ic.type}\0${ic.key}`;
          const cur = icRows.get(k);
          if (!cur) {
            icRows.set(k, { ...ic, pages: 1 });
          } else {
            cur.pages++;
            cur.transitions += ic.transitions;
          }
        }
        for (const d of sum.deopts) {
          const k = `${d.site}\0${d.reason}\0${d.type}`;
          const cur = deoptRows.get(k);
          deoptRows.set(k, cur ? { ...cur, count: cur.count + d.count } : { ...d });
        }
      }
      const summary = { variant: spec.id, pages: pages.length, maps, ics: [...icRows.values()], deopts: [...deoptRows.values()] };
      writeFileSync(join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));

      console.log(`\n=== ${spec.id}: polymorphic (P) / megamorphic (N) IC sites in main.js (${pages.length} pages) ===`);
      console.log(
        table(
          ['state', 'type', 'key', 'function', 'site', 'transitions'],
          summary.ics.slice(0, top).map((s) => [s.worst, s.type, s.key.slice(0, 24), s.fn.slice(0, 32), s.site, s.transitions]),
        ),
      );
      console.log(`\n=== ${spec.id}: deoptimizations in main.js ===`);
      console.log(
        table(
          ['count', 'type', 'reason', 'function', 'site'],
          summary.deopts.slice(0, top).map((d) => [d.count, d.type, String(d.reason).slice(0, 40), d.fn.slice(0, 32), d.site]),
        ),
      );
      console.log(`\nmap events: ${maps}; logs and summary: ${outDir}`);
    }
  } finally {
    await server.close();
  }
  return 0;
}
