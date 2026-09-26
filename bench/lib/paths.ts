import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const BENCH_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
export const REPO_DIR = dirname(BENCH_DIR);
export const REPO_NODE_MODULES = join(REPO_DIR, 'node_modules');

// Kept outside the repository so Jest's haste map never sees duplicate
// inferno packages from variant builds.
export const CACHE_DIR =
  process.env.INFERNO_BENCH_CACHE ?? join(process.env.XDG_CACHE_HOME ?? join(homedir(), '.cache'), 'inferno-bench');

export function cachePath(...parts: string[]): string {
  return join(CACHE_DIR, ...parts);
}

export const JFB_DIR = process.env.JFB_DIR ?? join(homedir(), 'git', 'js-framework-benchmark');
export const CHROMIUM_SRC = process.env.CHROMIUM_SRC ?? join(homedir(), 'chromium', 'src');
