import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { CDPSession } from 'puppeteer-core';
import { BENCH_DIR, cachePath } from '../lib/paths.ts';
import { run } from '../lib/util.ts';

export const PMU_EVENTS = ['instructions', 'cycles', 'branch-misses', 'L1-dcache-load-misses', 'stalled-cycles-frontend'] as const;
export type PmuEvent = (typeof PMU_EVENTS)[number];

export interface PmuRead {
  events: string[];
  threads: { tid: number; enabled: number; running: number; counts: number[]; error?: string }[];
}

const PMU_SRC = join(BENCH_DIR, 'native/pmu/pmu.c');
const PMU_BIN = cachePath('tools', 'pmu');

/** Compiles the helper on first use (or when the source is newer than the binary). */
export async function ensurePmuBinary(): Promise<string> {
  if (!existsSync(PMU_BIN) || statSync(PMU_SRC).mtimeMs > statSync(PMU_BIN).mtimeMs) {
    mkdirSync(cachePath('tools'), { recursive: true });
    await run('cc', ['-O2', '-Wall', '-o', PMU_BIN, PMU_SRC]);
  }
  return PMU_BIN;
}

/** Line-oriented client for native/pmu. */
export class Pmu {
  private proc: ChildProcessWithoutNullStreams;
  private buf = '';
  private pending: ((line: string) => void)[] = [];

  private constructor(proc: ChildProcessWithoutNullStreams) {
    this.proc = proc;
    proc.stdout.on('data', (d) => {
      this.buf += d;
      let i: number;
      while ((i = this.buf.indexOf('\n')) !== -1) {
        const line = this.buf.slice(0, i);
        this.buf = this.buf.slice(i + 1);
        this.pending.shift()?.(line);
      }
    });
  }

  static async start(): Promise<Pmu> {
    const bin = await ensurePmuBinary();
    return new Pmu(spawn(bin, [], { stdio: ['pipe', 'pipe', 'pipe'] }));
  }

  async send(cmd: string): Promise<any> {
    const res = new Promise<string>((resolve) => this.pending.push(resolve));
    this.proc.stdin.write(cmd + '\n');
    const parsed = JSON.parse(await res);
    if (parsed.error) {
      throw new Error(`pmu: ${parsed.error}`);
    }
    return parsed;
  }

  open(tids: number[]): Promise<any> {
    return this.send(`open ${tids.join(' ')}`);
  }

  read(): Promise<PmuRead> {
    return this.send('read');
  }

  async stop(): Promise<void> {
    await this.send('quit').catch(() => {});
    this.proc.kill();
  }
}

export interface RendererThreads {
  pid: number;
  main: number;
  compositor: number[];
  /** Renderer tile workers plus every GPU-process thread (raster runs out of process). */
  gpu: number[];
}

/** Classifies a renderer's threads by /proc comm (names are truncated to 15 chars). */
export function rendererThreads(pid: number): RendererThreads {
  const out: RendererThreads = { pid, main: pid, compositor: [], gpu: [] };
  for (const tid of readdirSync(`/proc/${pid}/task`)) {
    let comm = '';
    try {
      comm = readFileSync(`/proc/${pid}/task/${tid}/comm`, 'utf8').trim();
    } catch {
      continue;
    }
    if (comm === 'Compositor') {
      out.compositor.push(Number(tid));
    } else if (comm.startsWith('CompositorTileW')) {
      out.gpu.push(Number(tid));
    }
  }
  return out;
}

export async function gpuThreads(browserCdp: CDPSession): Promise<number[]> {
  const info = (await browserCdp.send('SystemInfo.getProcessInfo')) as any;
  const gpu = info.processInfo.find((p: any) => p.type === 'GPU');
  if (!gpu) {
    return [];
  }
  try {
    return readdirSync(`/proc/${gpu.id}/task`).map(Number);
  } catch {
    return [];
  }
}

function cpuNs(pid: number): number {
  try {
    return Number(readFileSync(`/proc/${pid}/schedstat`, 'utf8').split(' ')[0]);
  } catch {
    return NaN;
  }
}

/**
 * Finds which of the candidate renderer processes hosts the page: spin 30 ms of
 * JS in the page and see whose main thread CPU time moved by that much.
 * (A new context can create several renderers: blank tab, COOP swap, spare.)
 */
export async function identifyRenderer(candidates: number[], spin: () => Promise<unknown>): Promise<number> {
  // Baseline over a comparable interval without the spin, so a busy background
  // renderer can't win just by being busy.
  const t0 = candidates.map(cpuNs);
  await new Promise((r) => setTimeout(r, 30));
  const t1 = candidates.map(cpuNs);
  await spin();
  const t2 = candidates.map(cpuNs);
  const deltas = candidates.map((_, i) => t2[i] - t1[i] - (t1[i] - t0[i]));
  let best = -1;
  deltas.forEach((d, i) => {
    if (Number.isFinite(d) && (best === -1 || d > deltas[best])) {
      best = i;
    }
  });
  if (best === -1 || deltas[best] < 20e6) {
    throw new Error(`could not identify the page's renderer (cpu deltas ${deltas.map((d) => (d / 1e6).toFixed(1)).join(', ')} ms)`);
  }
  return candidates[best];
}

export async function rendererPids(browserCdp: CDPSession): Promise<Set<number>> {
  const info = (await browserCdp.send('SystemInfo.getProcessInfo')) as any;
  return new Set(info.processInfo.filter((p: any) => p.type === 'renderer').map((p: any) => p.id as number));
}

/** Per-thread-class counter deltas: op minus null op. */
export interface CounterSample {
  main: Record<PmuEvent, number>;
  compositor: Record<PmuEvent, number>;
  gpu: Record<PmuEvent, number>;
  /** Some group was multiplexed (counts scaled, not exact). */
  multiplexed: boolean;
}

function zero(): Record<PmuEvent, number> {
  return Object.fromEntries(PMU_EVENTS.map((e) => [e, 0])) as Record<PmuEvent, number>;
}

export function classify(read: PmuRead, threads: RendererThreads): CounterSample {
  const out: CounterSample = { main: zero(), compositor: zero(), gpu: zero(), multiplexed: false };
  for (const t of read.threads) {
    if (t.error) {
      continue;
    }
    if (t.running < t.enabled) {
      out.multiplexed = true;
    }
    const cls = t.tid === threads.main ? 'main' : threads.compositor.includes(t.tid) ? 'compositor' : 'gpu';
    PMU_EVENTS.forEach((e, i) => (out[cls][e] += t.counts[i] ?? 0));
  }
  return out;
}

export function subtract(a: CounterSample, b: CounterSample): CounterSample {
  const sub = (x: Record<PmuEvent, number>, y: Record<PmuEvent, number>) =>
    Object.fromEntries(PMU_EVENTS.map((e) => [e, x[e] - y[e]])) as Record<PmuEvent, number>;
  return {
    main: sub(a.main, b.main),
    compositor: sub(a.compositor, b.compositor),
    gpu: sub(a.gpu, b.gpu),
    multiplexed: a.multiplexed || b.multiplexed,
  };
}
