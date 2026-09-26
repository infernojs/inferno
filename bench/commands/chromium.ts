import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { BENCH_DIR, CHROMIUM_SRC } from '../lib/paths.ts';

const SUBCOMMANDS = ['preflight', 'status', 'apply', 'unapply', 'build', 'verify'];

/**
 * InfernoProf build management. Every Chromium/V8/Perfetto source change lives
 * in bench/chromium (patches + //inferno_bench files) and is applied by these
 * scripts; the instrumentation is compiled out of every out dir except
 * out/InfernoProf.
 */
export default async function chromium(argv: string[]): Promise<number> {
  const [sub, ...rest] = argv;
  if (!sub || !SUBCOMMANDS.includes(sub)) {
    console.error(`usage: bench chromium ${SUBCOMMANDS.join('|')} [args]`);
    return 2;
  }
  const res = spawnSync('bash', [join(BENCH_DIR, 'chromium/scripts', `${sub}.sh`), ...rest], {
    stdio: 'inherit',
    env: { ...process.env, CHROMIUM_SRC },
  });
  return res.status ?? 1;
}
