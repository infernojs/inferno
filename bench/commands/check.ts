import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { buildOptionMatrix } from '../lib/options.ts';
import { BENCH_DIR } from '../lib/paths.ts';
import { readJson, run } from '../lib/util.ts';
import { buildMicroBundle, MICRO_DIR } from '../micro/build.ts';
import { ensureVariant } from '../variants/build.ts';
import { parseVariant } from '../variants/spec.ts';

const BASELINE = join(BENCH_DIR, 'baselines', 'domops.json');

interface Snapshot {
  dom: Record<string, number>;
  checksum: string | null;
}

async function worker(file: string, args: string[]): Promise<any> {
  const res = await run(process.execPath, ['--expose-gc', '--allow-natives-syntax', '--no-warnings', join(MICRO_DIR, 'worker.ts'), file, ...args], {
    allowFail: true,
    // No allocation pass: DOM ops and checksums only, which are machine independent.
    env: { ...process.env, INFERNO_BENCH_ALLOC_ITERS: '0' },
  });
  if (res.code !== 0) {
    throw new Error(`worker failed (${args[0]}):\n${res.stderr || res.stdout}`);
  }
  return JSON.parse(res.stdout.trim().split('\n').pop()!);
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Deterministic CI gate (no timing): size budgets, exact DOM operations per op
 * and final DOM checksums for every micro case, and vNode hidden-class checks.
 */
export default async function check(argv: string[]): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: {
      variant: { type: 'string', default: 'local' },
      update: { type: 'boolean', default: false },
      concurrency: { type: 'string', default: '4' },
    },
  });
  const variant = await ensureVariant(parseVariant(values.variant!));
  const [options] = buildOptionMatrix(undefined, 'off');
  const bundle = await buildMicroBundle(variant, options);
  let failures = 0;

  // 1. Hidden classes: every vNode creation path must share one map.
  const maps = (await worker(bundle.file, ['@maps'])).maps as Record<string, boolean>;
  const polymorphic = Object.entries(maps).filter(([, same]) => !same);
  console.log(`hidden classes: ${polymorphic.length ? 'FAIL ' + polymorphic.map(([k]) => k).join(', ') : 'all vNodes share one map'}`);
  failures += polymorphic.length;

  // 2. DOM operations + checksums per case against the committed baseline.
  const cases: string[] = (await worker(bundle.file, ['@list'])).cases;
  const snapshots: Record<string, Snapshot> = {};
  const queue = cases.slice();
  await Promise.all(
    Array.from({ length: Number(values.concurrency) }, async () => {
      for (let c = queue.shift(); c !== undefined; c = queue.shift()) {
        const r = await worker(bundle.file, [c]);
        const dom: Record<string, number> = {};
        for (const [k, v] of Object.entries(r.domTotals as Record<string, number>)) {
          dom[k] = round(v / r.iterations);
        }
        snapshots[c] = { dom, checksum: r.checksum };
      }
    }),
  );
  const ordered = Object.fromEntries(cases.map((c) => [c, snapshots[c]]));
  if (values.update || !existsSync(BASELINE)) {
    mkdirSync(join(BENCH_DIR, 'baselines'), { recursive: true });
    writeFileSync(BASELINE, JSON.stringify(ordered, null, 2) + '\n');
    console.log(`DOM ops: wrote baseline for ${cases.length} cases -> ${BASELINE}`);
  } else {
    const baseline = readJson<Record<string, Snapshot>>(BASELINE);
    let changed = 0;
    for (const c of cases) {
      const b = baseline[c];
      const s = ordered[c];
      if (!b) {
        console.log(`  new case ${c} (run with --update)`);
        continue;
      }
      if (JSON.stringify(b.dom) !== JSON.stringify(s.dom) || b.checksum !== s.checksum) {
        changed++;
        const keys = [...new Set([...Object.keys(b.dom), ...Object.keys(s.dom)])].sort();
        const deltas = keys
          .filter((k) => (b.dom[k] ?? 0) !== (s.dom[k] ?? 0))
          .map((k) => `${k} ${b.dom[k] ?? 0} -> ${s.dom[k] ?? 0}`);
        console.log(`  ${c}: ${deltas.join(', ')}${b.checksum !== s.checksum ? ' [rendered DOM differs]' : ''}`);
      }
    }
    console.log(`DOM ops: ${cases.length - changed}/${cases.length} cases match ${BASELINE}`);
    failures += changed;
  }

  // 3. Size budgets (only when a budget file exists).
  if (existsSync(join(BENCH_DIR, 'budgets.json'))) {
    const size = (await import('./size.ts')).default;
    failures += await size(['--variants', values.variant!]);
  }
  return failures ? 1 : 0;
}
