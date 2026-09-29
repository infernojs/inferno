import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { gzipSync } from 'node:zlib';
import { analyzeLeak, type LeakAnalysis, parseSnapshot } from '../analysis/heapdiff.ts';
import { buildApp } from '../apps/build.ts';
import { APPS } from '../apps/registry.ts';
import { type HeadlessMode, resolveBrowser } from '../lib/browsers.ts';
import { snapshotEnv } from '../lib/env.ts';
import { buildOptionMatrix } from '../lib/options.ts';
import { cachePath } from '../lib/paths.ts';
import { seededShuffle } from '../lib/stats.ts';
import { table } from '../lib/util.ts';
import { launchBrowser } from '../runner/launch.ts';
import { PageSession } from '../runner/session.ts';
import { startServer } from '../server/server.ts';
import { ensureVariant } from '../variants/build.ts';
import { parseVariantList } from '../variants/spec.ts';

/**
 * Drives run/clear cycles inside the page. One constant expression per phase:
 * per-cycle CDP evaluations with changing sources (the run-mode workloads)
 * leave compiled scripts and strings behind that look like page leaks.
 * el.click() reaches Inferno's delegated document listener like real input.
 */
const DRIVER = String.raw`(() => {
  const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
  window.__leakCycles = async (n) => {
    const run = document.getElementById('run');
    const clear = document.getElementById('clear');
    for (let i = 0; i < n; i++) {
      run.click();
      if (!document.querySelector('tbody tr')) throw new Error('run rendered no rows');
      await frame();
      clear.click();
      if (document.querySelector('tbody tr')) throw new Error('clear left rows');
      await frame();
    }
    return n;
  };
})()`;

async function heapUsage(s: PageSession): Promise<{ jsHeap: number; embedderHeap: number }> {
  const u = (await s.cdp.send('Runtime.getHeapUsage')) as any;
  return { jsHeap: u.usedSize, embedderHeap: u.embedderHeapUsedSize ?? 0 };
}

async function settleAndCollect(s: PageSession): Promise<void> {
  await s.cdp.send('HeapProfiler.collectGarbage');
  await s.cdp.send('HeapProfiler.collectGarbage');
  // Let concurrent sweeping finish before sizes are read.
  await s.frames(2);
  await s.cdp.send('HeapProfiler.collectGarbage');
}

async function takeSnapshot(s: PageSession): Promise<{ raw: string; parsed: ReturnType<typeof parseSnapshot> }> {
  const chunks: string[] = [];
  const onChunk = (e: { chunk: string }) => chunks.push(e.chunk);
  s.cdp.on('HeapProfiler.addHeapSnapshotChunk', onChunk);
  try {
    await s.cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false, captureNumericValue: false } as any);
  } finally {
    s.cdp.off('HeapProfiler.addHeapSnapshotChunk', onChunk);
  }
  const raw = chunks.join('');
  return { raw, parsed: parseSnapshot(JSON.parse(raw)) };
}

interface LeakRecord {
  block: number;
  variant: string;
  heap: { jsHeap: number; embedderHeap: number }[];
  analysis: LeakAnalysis;
}

function tail(text: string, n: number): string {
  return text.length > n ? `…${text.slice(-n)}` : text;
}

function kb(n: number): string {
  return `${(n / 1024).toFixed(1)} KB`;
}

export default async function leak(argv: string[]): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: {
      variants: { type: 'string' },
      app: { type: 'string', default: 'jfb-keyed' },
      warmup: { type: 'string', default: '5' },
      cycles: { type: 'string', default: '10' },
      blocks: { type: 'string', default: '1' },
      browser: { type: 'string', default: 'cft-152' },
      headless: { type: 'string', default: 'new' },
      'js-flags': { type: 'string' },
      transform: { type: 'string' },
      minify: { type: 'string' },
      top: { type: 'string', default: '15' },
      save: { type: 'boolean', default: false },
      seed: { type: 'string', default: '1' },
      json: { type: 'boolean', default: false },
    },
  });
  const app = APPS[values.app!];
  if (!app || !app.name.startsWith('jfb')) {
    throw new Error('--app must be a jfb app (the driver clicks #run and #clear)');
  }
  const specs = parseVariantList(values.variants);
  const resolved = resolveBrowser(values.browser!, values.headless as HeadlessMode);
  const [options] = buildOptionMatrix(values.transform, values.minify ?? 'on');
  const warmup = Number(values.warmup);
  const cycles = Number(values.cycles);
  const blocks = Number(values.blocks);
  const top = Number(values.top);
  const jsFlags = values['js-flags'] ? values['js-flags'].split(/\s+/).filter(Boolean) : [];

  const server = await startServer();
  const urls = new Map<string, string>();
  for (const spec of specs) {
    const variant = await ensureVariant(spec);
    const built = await buildApp(app, variant, options);
    urls.set(spec.id, server.origin + server.mount(built.dir));
  }

  const started = Date.now();
  const runId = new Date(started).toISOString().replace(/[:.]/g, '-');
  const outDir = cachePath('results', 'leak');
  const snapDir = join(outDir, `${runId}-snapshots`);
  mkdirSync(outDir, { recursive: true });
  if (values.save) {
    mkdirSync(snapDir, { recursive: true });
  }
  const records: LeakRecord[] = [];
  const envs = [];
  try {
    for (let b = 0; b < blocks; b++) {
      envs.push(snapshotEnv());
      const launched = await launchBrowser(resolved, { headless: values.headless as HeadlessMode, sandbox: true, jsFlags });
      try {
        for (const spec of seededShuffle(specs, Number(values.seed) * 31 + b)) {
          if (!values.json) {
            process.stderr.write(`\rblock ${b + 1}/${blocks} ${spec.id}`.padEnd(80));
          }
          const s = await PageSession.open(launched.browser, urls.get(spec.id)!);
          try {
            await s.waitFor(`!!document.getElementById('run')`);
            await s.evaluate(DRIVER);
            await s.cdp.send('HeapProfiler.enable');
            const heap = [];
            const snaps = [];
            for (const n of [warmup, cycles, cycles]) {
              await s.evaluate(`window.__leakCycles(${n})`);
              await settleAndCollect(s);
              heap.push(await heapUsage(s));
              const snap = await takeSnapshot(s);
              if (values.save) {
                writeFileSync(join(snapDir, `${spec.id}_b${b}_s${snaps.length + 1}.heapsnapshot.gz`), gzipSync(snap.raw));
              }
              snaps.push(snap.parsed);
            }
            records.push({ block: b, variant: spec.id, heap, analysis: analyzeLeak(snaps[0], snaps[1], snaps[2], top) });
          } finally {
            await s.close();
          }
        }
      } finally {
        await launched.close();
      }
    }
  } finally {
    await server.close();
    if (!values.json) {
      process.stderr.write(`\r${''.padEnd(80)}\r`);
    }
  }

  const out = {
    createdAt: new Date(started).toISOString(),
    durationS: (Date.now() - started) / 1000,
    browser: resolved,
    options: { app: app.name, warmup, cycles, blocks, jsFlags, transform: options.transform, minify: options.minify },
    envs,
    records,
  };
  const outFile = join(outDir, `${runId}.json`);
  writeFileSync(outFile, JSON.stringify(out, null, 2));
  if (values.json) {
    console.log(JSON.stringify(out, null, 2));
    return 0;
  }

  for (const r of records) {
    const [h1, h2, h3] = r.heap;
    console.log(`\n== ${r.variant} (block ${r.block + 1}): ${cycles} cycles per window after ${warmup} warmup cycles`);
    console.log(
      `JS heap ${kb(h1.jsHeap)} → ${kb(h2.jsHeap)} → ${kb(h3.jsHeap)}; Blink heap ${kb(h1.embedderHeap)} → ${kb(h2.embedderHeap)} → ${kb(h3.embedderHeap)}`,
    );
    console.log(
      `survivors (allocated in window 1, alive after window 2): ${r.analysis.survivorCount} objects, ${kb(r.analysis.survivorBytes)}`,
    );
    console.log(
      table(
        ['survivor group', 'count', 'bytes', 'shortest retaining path'],
        // The nearest retainers are at the end of the path.
        r.analysis.survivors.map((g) => [g.group.slice(0, 48), g.count, g.bytes, tail(g.paths[0] ?? '', 150)]),
      ),
    );
    console.log(
      table(
        ['growth by group', 'Δbytes w1', 'Δbytes w2', 'Δcount w1', 'Δcount w2'],
        r.analysis.growth.map((g) => [g.group.slice(0, 48), g.d12, g.d23, g.c12, g.c23]),
      ),
    );
  }
  console.log(`\nresults: ${outFile}${values.save ? `\nsnapshots: ${snapDir}` : ''}`);
  return 0;
}
