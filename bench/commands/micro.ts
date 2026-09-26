import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { buildOptionMatrix } from '../lib/options.ts';
import { CHROMIUM_SRC, cachePath } from '../lib/paths.ts';
import { mean, median, seededShuffle, shift, summarize } from '../lib/stats.ts';
import { run, table } from '../lib/util.ts';
import { snapshotEnv } from '../lib/env.ts';
import { buildMicroBundle, MICRO_DIR, type MicroBundle, type MicroRuntime } from '../micro/build.ts';
import { ensureVariant } from '../variants/build.ts';
import { parseVariantList } from '../variants/spec.ts';

/** Default selection: the jfb ops plus representative diff, lifecycle and event cases. */
const DEFAULT_CASES = [
  'jfb/keyed/*',
  'keyed/el/*',
  'keyed/fc/swap2',
  'keyed/fc/reverse',
  'nonkeyed/el/*',
  'mount/*',
  'unmount/*',
  'patch-same/*',
  'vnode/*',
  'state/*',
  'events/*',
  'fuzz/*',
  'ssr/*',
];

interface WorkerResult {
  version: string;
  case: string;
  iterations: number;
  timesNs: number[];
  /** d8 with InfernoProf counters only: user-space instructions per op. */
  instructions?: number[];
  allocBytes: number[];
  allocSites: { site: string; bytesPerOp: number }[];
  gc: { count: number; timeMs: number; iterationsWithGc: number[] };
  domTotals: Record<string, number>;
  checksum: string | null;
}

function globToRegExp(glob: string): RegExp {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`);
}

function d8Flags(deterministic: boolean): string[] {
  const flags = ['--expose-gc', '--allow-natives-syntax', '--expose-statistics'];
  if (deterministic) {
    flags.push('--single-threaded', '--random-seed=1', '--hash-seed=1');
  }
  return flags;
}

let d8Path = join(CHROMIUM_SRC, 'out/InfernoProf/d8');

function nodeFlags(deterministic: boolean): string[] {
  const flags = ['--expose-gc', '--allow-natives-syntax', '--no-warnings'];
  if (deterministic) {
    // No concurrent compiler/GC threads and fixed seeds: minimal run-to-run variance.
    flags.push('--single-threaded', '--random-seed=1', '--hash-seed=1');
  }
  return flags;
}

async function worker(bundle: MicroBundle, args: string[], deterministic: boolean): Promise<any> {
  const res =
    bundle.runtime === 'd8'
      ? await run(d8Path, [...d8Flags(deterministic), bundle.file, '--', ...args], { allowFail: true })
      : await run(process.execPath, [...nodeFlags(deterministic), join(MICRO_DIR, 'worker.ts'), bundle.file, ...args], {
          allowFail: true,
        });
  if (res.code !== 0) {
    throw new Error(`worker failed for ${bundle.variant.spec.id} ${args[0]}:\n${res.stderr || res.stdout}`);
  }
  return JSON.parse(res.stdout.trim().split('\n').pop()!);
}

function perOp(totals: Record<string, number>, iterations: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(totals)) {
    out[k] = v / iterations;
  }
  return out;
}

function sumOps(ops: Record<string, number>, reads: boolean): number {
  return Object.entries(ops)
    .filter(([k]) => reads === k.startsWith('get:'))
    .reduce((a, [, v]) => a + v, 0);
}

function fmtNs(ns: number): string {
  if (ns >= 1e6) {
    return `${(ns / 1e6).toFixed(3)} ms`;
  }
  if (ns >= 1e3) {
    return `${(ns / 1e3).toFixed(2)} µs`;
  }
  return `${ns.toFixed(0)} ns`;
}

function fmtDelta(n: number, digits = 0): string {
  if (Math.abs(n) < 10 ** -digits / 2) {
    return '0';
  }
  return `${n > 0 ? '+' : ''}${n.toFixed(digits)}`;
}

/** The most recent report, for wrappers such as `bench aa`. */
export let lastReport: any[] = [];

export default async function micro(argv: string[]): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: {
      variants: { type: 'string' },
      cases: { type: 'string' },
      rounds: { type: 'string', default: '5' },
      iterations: { type: 'string' },
      warmup: { type: 'string' },
      transform: { type: 'string' },
      'gc-each': { type: 'boolean', default: false },
      deterministic: { type: 'boolean', default: false },
      list: { type: 'boolean', default: false },
      maps: { type: 'boolean', default: false },
      ops: { type: 'boolean', default: false },
      'alloc-sites': { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
      seed: { type: 'string', default: '1' },
      runtime: { type: 'string', default: 'node' },
      metric: { type: 'string', default: 'time' },
      d8: { type: 'string' },
    },
  });
  const runtime = values.runtime as MicroRuntime;
  if (runtime !== 'node' && runtime !== 'd8') {
    throw new Error('--runtime must be node or d8');
  }
  if (values.d8) {
    d8Path = values.d8;
  }
  if (runtime === 'd8' && !existsSync(d8Path)) {
    throw new Error(`d8 not found at ${d8Path}: build it with \`pnpm bench chromium build\` or pass --d8 <path>`);
  }
  const specs = parseVariantList(values.variants);
  const [options] = buildOptionMatrix(values.transform, 'off');
  const deterministic = values.deterministic!;

  const bundles: MicroBundle[] = [];
  for (const spec of specs) {
    const variant = await ensureVariant(spec);
    bundles.push(await buildMicroBundle(variant, options, runtime));
  }

  const listing = await worker(bundles[0], ['@list'], deterministic);
  if (values.list) {
    console.log(listing.cases.join('\n'));
    return 0;
  }
  if (values.maps) {
    const rows: (string | number)[][] = [];
    const results = await Promise.all(bundles.map((b) => worker(b, ['@maps'], deterministic)));
    const names = Object.keys(results[0].maps);
    for (const name of names) {
      rows.push([name, ...results.map((r) => (r.maps[name] ? 'same' : 'DIFFERENT'))]);
    }
    console.log('vNode hidden class vs createVNode(element) (%HaveSameMap)');
    console.log(table(['vNode', ...specs.map((s) => s.id)], rows));
    return 0;
  }

  const patterns = (values.cases ? values.cases.split(',') : DEFAULT_CASES).map((p) => globToRegExp(p.trim()));
  const caseNames: string[] = listing.cases.filter((c: string) => patterns.some((re) => re.test(c)));
  if (caseNames.length === 0) {
    throw new Error('No cases matched');
  }
  const rounds = Number(values.rounds);
  const extra = [values.iterations ?? '', values.warmup ?? '', values['gc-each'] ? '1' : '0'];

  const results = new Map<string, WorkerResult[]>();
  const key = (variant: string, c: string) => `${variant}\0${c}`;
  const pairs = bundles.flatMap((b) => caseNames.map((c) => ({ bundle: b, c })));
  const env = snapshotEnv();
  const started = Date.now();
  for (let r = 0; r < rounds; r++) {
    const order = seededShuffle(pairs, Number(values.seed) * 1000 + r);
    for (const [i, { bundle, c }] of order.entries()) {
      if (!values.json) {
        process.stderr.write(`\rround ${r + 1}/${rounds} ${i + 1}/${order.length} ${c}`.padEnd(100).slice(0, 100));
      }
      const res: WorkerResult = await worker(bundle, [c, ...extra], deterministic);
      const k = key(bundle.variant.spec.id, c);
      results.set(k, [...(results.get(k) ?? []), res]);
    }
  }
  if (!values.json) {
    process.stderr.write(`\r${''.padEnd(100)}\r`);
  }

  const baseId = specs[0].id;
  const report: any[] = [];
  const rows: (string | number)[][] = [];
  for (const c of caseNames) {
    const base = results.get(key(baseId, c))!;
    // time (ns/op) everywhere; instructions/op when the d8 build has counters.
    const series = (r: WorkerResult) => (values.metric === 'instructions' && r.instructions?.length ? r.instructions : r.timesNs);
    const baseBlocks = base.map((r) => median(series(r)));
    const baseAlloc = mean(base.flatMap((r) => r.allocBytes));
    const baseDom = perOp(base[0].domTotals, base[0].iterations);
    for (const spec of specs) {
      const res = results.get(key(spec.id, c))!;
      const blocks = res.map((r) => median(series(r)));
      const time = summarize(blocks);
      const alloc = mean(res.flatMap((r) => r.allocBytes));
      const dom = perOp(res[0].domTotals, res[0].iterations);
      const domStable = res.every((r) => JSON.stringify(r.domTotals) === JSON.stringify(res[0].domTotals));
      const checksumOk = res.every((r) => r.checksum === base[0].checksum);
      const gcIters = res.reduce((a, r) => a + r.gc.iterationsWithGc.length, 0) / res.length;
      // A CI from fewer than 3 blocks per side is meaningless; report the point estimate only.
      const est = spec.id === baseId ? null : blocks.length >= 3 && baseBlocks.length >= 3 ? shift(baseBlocks, blocks) : null;
      const pointPct = spec.id === baseId ? null : ((median(blocks) - median(baseBlocks)) / median(baseBlocks)) * 100;
      report.push({
        case: c,
        variant: spec.id,
        time,
        blocks,
        est,
        alloc,
        allocSites: res[0].allocSites,
        canaryCallsPerOp: (res[0] as any).canaryCallsPerOp ?? 0,
        dom,
        domStable,
        checksumOk,
        gcIters,
        checksum: res[0].checksum,
      });
      rows.push([
        spec.id === baseId ? c : '',
        spec.id,
        values.metric === 'instructions' ? `${(time.median / 1e6).toFixed(3)} Minstr` : fmtNs(time.median),
        time.n >= 3 ? `${(time.rcv * 100).toFixed(1)}%` : '-',
        est
          ? `${fmtDelta(est.pct, 1)}% [${fmtDelta(est.ciLow, 1)},${fmtDelta(est.ciHigh, 1)}]${est.significant ? ' *' : ''}`
          : pointPct !== null
            ? `${fmtDelta(pointPct, 1)}% (no CI: <3 rounds)`
            : '',
        spec.id === baseId ? Math.round(alloc) : fmtDelta(alloc - baseAlloc),
        spec.id === baseId ? sumOps(dom, false).toFixed(1) : fmtDelta(sumOps(dom, false) - sumOps(baseDom, false), 1),
        spec.id === baseId ? sumOps(dom, true).toFixed(1) : fmtDelta(sumOps(dom, true) - sumOps(baseDom, true), 1),
        gcIters.toFixed(1),
        (checksumOk ? 'ok' : 'DIFF') + (domStable ? '' : ' unstable'),
      ]);
    }
  }

  const out = {
    createdAt: new Date().toISOString(),
    durationS: (Date.now() - started) / 1000,
    env,
    options: { rounds, deterministic, gcEach: values['gc-each'], transform: options.transform },
    variants: bundles.map((b) => ({ id: b.variant.spec.id, manifest: b.variant.manifest, bundle: b.file })),
    report,
  };
  lastReport = report;
  const outDir = cachePath('results', 'micro');
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${out.createdAt.replace(/[:.]/g, '-')}.json`);
  writeFileSync(outFile, JSON.stringify(out, null, 2));

  if (values.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      table(
        ['case', 'variant', 'time/op', 'rCV', `Δtime vs ${baseId} [95% CI]`, 'alloc B/op', 'DOM writes/op', 'DOM reads/op', 'GC iters', 'check'],
        rows,
      ),
    );
    if (values.ops) {
      console.log('\nDOM operations per op (exact; reads are get:*)');
      const opRows: (string | number)[][] = [];
      for (const c of caseNames) {
        const entries = report.filter((r) => r.case === c);
        const baseDom = JSON.stringify(entries[0].dom);
        for (const e of entries) {
          const text = Object.entries(e.dom as Record<string, number>)
            .map(([k, v]) => `${k}=${Number.isInteger(v) ? v : v.toFixed(2)}`)
            .join(' ');
          opRows.push([e === entries[0] ? c : '', e.variant, e === entries[0] || JSON.stringify(e.dom) !== baseDom ? text : '(same)']);
        }
      }
      console.log(table(['case', 'variant', 'ops'], opRows));
    }
    if (values['alloc-sites']) {
      console.log('\nTop allocation sites (bytes/op, sampling heap profiler, 8 B interval)');
      for (const c of caseNames) {
        for (const e of report.filter((r) => r.case === c)) {
          console.log(`\n${c} [${e.variant}] total ${Math.round(e.alloc)} B/op`);
          for (const s of e.allocSites.slice(0, 8)) {
            console.log(`  ${String(Math.round(s.bytesPerOp)).padStart(9)}  ${s.site}`);
          }
        }
      }
    }
    console.log(`\n${rounds} rounds × ${bundles.length} variants × ${caseNames.length} cases in ${out.durationS.toFixed(0)} s; * = CI excludes 0`);
    console.log(`results: ${outFile}`);
  }
  return report.some((r) => !r.checksumOk) ? 1 : 0;
}
