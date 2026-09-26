import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer, { type Browser } from 'puppeteer-core';
import type { HeadlessMode, ResolvedBrowser } from '../lib/browsers.ts';
import { cachePath } from '../lib/paths.ts';
import { chromeArgs } from './flags.ts';

export interface LaunchOptions {
  headless: HeadlessMode;
  sandbox: boolean;
  jsFlags?: string[];
  extraArgs?: string[];
  /** Command prefix, e.g. ['taskset', '-c', '0-7,16-23'] or a perf invocation. */
  wrapper?: string[];
  env?: Record<string, string>;
  /** Working directory (V8 writes jitdump/log files there when unsandboxed). */
  cwd?: string;
}

export interface LaunchedBrowser {
  browser: Browser;
  proc: ChildProcess;
  args: string[];
  close(): Promise<void>;
}

function waitForEndpoint(proc: ChildProcess, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    let buf = '';
    const timer = setTimeout(() => reject(new Error(`Browser did not start within ${timeoutMs} ms:\n${buf.slice(-2000)}`)), timeoutMs);
    proc.stderr!.on('data', (d) => {
      buf += d;
      const m = /DevTools listening on (ws:\/\/\S+)/.exec(buf);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    proc.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Browser exited with ${code} before DevTools was ready:\n${buf.slice(-2000)}`));
    });
  });
}

/** Launches the browser ourselves (so it can be wrapped) and connects over CDP. */
export async function launchBrowser(resolved: ResolvedBrowser, o: LaunchOptions): Promise<LaunchedBrowser> {
  mkdirSync(cachePath('tmp'), { recursive: true });
  const userDataDir = mkdtempSync(join(cachePath('tmp'), 'profile-'));
  const args = chromeArgs({
    headless: o.headless,
    sandbox: o.sandbox,
    isHeadlessShell: resolved.isHeadlessShell,
    userDataDir,
    jsFlags: o.jsFlags,
    extraArgs: o.extraArgs,
  });
  const [cmd, ...pre] = o.wrapper?.length ? [...o.wrapper, resolved.executable] : [resolved.executable];
  const proc = spawn(cmd, [...pre, ...args], {
    stdio: ['ignore', 'ignore', 'pipe'],
    env: { ...process.env, ...o.env },
    cwd: o.cwd,
    detached: true,
  });
  try {
    const endpoint = await waitForEndpoint(proc, 60_000);
    const browser = await puppeteer.connect({ browserWSEndpoint: endpoint, defaultViewport: null, protocolTimeout: 300_000 });
    return {
      browser,
      proc,
      args,
      async close() {
        await browser.close().catch(() => {});
        await new Promise<void>((resolve) => {
          if (proc.exitCode !== null) {
            resolve();
            return;
          }
          const t = setTimeout(() => {
            try {
              process.kill(-proc.pid!, 'SIGKILL');
            } catch {
              // already gone
            }
            resolve();
          }, 5000);
          proc.once('exit', () => {
            clearTimeout(t);
            resolve();
          });
        });
        rmSync(userDataDir, { recursive: true, force: true });
      },
    };
  } catch (err) {
    try {
      process.kill(-proc.pid!, 'SIGKILL');
    } catch {
      // ignore
    }
    rmSync(userDataDir, { recursive: true, force: true });
    throw err;
  }
}
