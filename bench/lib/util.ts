import { spawn, type SpawnOptions } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

/** Stable hash over (path, content) pairs; order independent. */
export function hashEntries(entries: Iterable<[string, string | Buffer]>): string {
  const sorted = [...entries].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const h = createHash('sha256');
  for (const [path, content] of sorted) {
    h.update(path);
    h.update('\0');
    h.update(sha256(content));
    h.update('\n');
  }
  return h.digest('hex');
}

/** Recursively lists files under dir as paths relative to base (posix separators). */
export function listFiles(dir: string, base: string = dir): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listFiles(full, base));
    } else {
      out.push(relative(base, full).split(sep).join('/'));
    }
  }
  return out.sort();
}

export function readJson<T = any>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

export interface RunOptions extends SpawnOptions {
  /** Capture output instead of inheriting stdio. */
  capture?: boolean;
  /** Do not throw on a non-zero exit code. */
  allowFail?: boolean;
  input?: string | Buffer;
}

export function run(cmd: string, args: string[], opts: RunOptions = {}): Promise<RunResult> {
  const { capture = true, allowFail = false, input, ...spawnOpts } = opts;
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: capture ? ['pipe', 'pipe', 'pipe'] : ['pipe', 'inherit', 'inherit'],
      ...spawnOpts,
    });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (d) => (stdout += d));
    child.stderr?.on('data', (d) => (stderr += d));
    child.on('error', reject);
    child.on('close', (code) => {
      const result = { code: code ?? -1, stdout, stderr };
      if (result.code !== 0 && !allowFail) {
        reject(new Error(`${cmd} ${args.join(' ')} exited with ${result.code}\n${stderr || stdout}`));
      } else {
        resolve(result);
      }
    });
    if (input !== undefined) {
      child.stdin?.end(input);
    } else {
      child.stdin?.end();
    }
  });
}

export function formatBytes(n: number): string {
  if (n < 1024) {
    return `${n} B`;
  }
  return `${(n / 1024).toFixed(2)} KiB`;
}

/** Renders rows as an aligned plain-text table. */
export function table(head: string[], rows: (string | number)[][]): string {
  const all = [head, ...rows.map((r) => r.map(String))];
  const widths = head.map((_, i) => Math.max(...all.map((r) => (r[i] ?? '').length)));
  const line = (r: string[]) =>
    r.map((c, i) => (i === 0 ? c.padEnd(widths[i]) : c.padStart(widths[i]))).join('  ');
  return [line(all[0]), widths.map((w) => '-'.repeat(w)).join('  '), ...all.slice(1).map(line)].join('\n');
}
