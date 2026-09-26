import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { buildOptionMatrix } from '../lib/options.ts';
import { run } from '../lib/util.ts';
import { buildMicroBundle, MICRO_DIR } from '../micro/build.ts';
import { ensureVariant } from '../variants/build.ts';
import { parseVariant } from '../variants/spec.ts';

async function worker(file: string, args: string[], dom: 'shim' | 'jsdom'): Promise<any> {
  const res = await run(process.execPath, ['--expose-gc', '--allow-natives-syntax', '--no-warnings', join(MICRO_DIR, 'worker.ts'), file, ...args], {
    allowFail: true,
    env: { ...process.env, INFERNO_BENCH_DOM: dom, INFERNO_BENCH_ALLOC_ITERS: '1', INFERNO_BENCH_NORMALIZE_STYLE: '1' },
  });
  if (res.code !== 0) {
    throw new Error(`${dom} worker failed (${args.join(' ')}):\n${res.stderr || res.stdout}`);
  }
  return JSON.parse(res.stdout.trim().split('\n').pop()!);
}

function firstDiff(a: string, b: string): string {
  let i = 0;
  while (i < a.length && a[i] === b[i]) {
    i++;
  }
  return `at ${i}:\n  shim : …${a.slice(Math.max(0, i - 60), i + 80)}\n  jsdom: …${b.slice(Math.max(0, i - 60), i + 80)}`;
}

/**
 * Checks the counting DOM shim against jsdom: identical serialized DOM after
 * every fuzz step and identical final checksums for every micro case.
 */
export default async function verifyShim(argv: string[]): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: {
      variant: { type: 'string', default: 'local' },
      seeds: { type: 'string', default: '20' },
      steps: { type: 'string', default: '40' },
    },
  });
  const variant = await ensureVariant(parseVariant(values.variant!));
  const [options] = buildOptionMatrix(undefined, 'off');
  const bundle = await buildMicroBundle(variant, options);
  let failures = 0;

  for (let seed = 1; seed <= Number(values.seeds); seed++) {
    const args = ['@fuzz-trace', String(seed), values.steps!];
    const [a, b] = await Promise.all([worker(bundle.file, args, 'shim'), worker(bundle.file, args, 'jsdom')]);
    const step = a.trace.findIndex((html: string, i: number) => html !== b.trace[i]);
    if (step !== -1) {
      failures++;
      console.log(`fuzz seed ${seed}: DOM differs at step ${step} ${firstDiff(a.trace[step], b.trace[step])}`);
    }
  }
  console.log(`fuzz: ${Number(values.seeds) - failures}/${values.seeds} sequences identical over ${values.steps} steps`);

  const listing = await worker(bundle.file, ['@list'], 'shim');
  let caseFailures = 0;
  for (const c of listing.cases as string[]) {
    const [a, b] = await Promise.all([worker(bundle.file, [c, '3', '1'], 'shim'), worker(bundle.file, [c, '3', '1'], 'jsdom')]);
    if (a.checksum !== b.checksum) {
      caseFailures++;
      console.log(`case ${c}: checksum shim ${a.checksum} != jsdom ${b.checksum}`);
    }
  }
  console.log(`cases: ${listing.cases.length - caseFailures}/${listing.cases.length} identical final DOM`);
  return failures + caseFailures ? 1 : 0;
}
