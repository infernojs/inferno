import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statfsSync } from 'node:fs';
import { cpus, loadavg, totalmem } from 'node:os';
import { join } from 'node:path';

/**
 * Read-only snapshot of machine state that affects measurement noise. Nothing
 * here writes to sysfs/procfs: the lab works with the machine as configured.
 */
export interface EnvSnapshot {
  takenAt: string;
  cpuModel: string;
  logicalCpus: number;
  memBytes: number;
  loadavg: number[];
  governor: Record<string, number>;
  epp: Record<string, number>;
  boost: string | null;
  smt: string | null;
  nmiWatchdog: string | null;
  perfEventParanoid: string | null;
  rdpmc: string | null;
  cpuPressure: string | null;
  temperatures: Record<string, number>;
  freqMHz: { min: number; max: number; mean: number } | null;
  node: string;
  busyBuilds: string[];
}

function read(path: string): string | null {
  try {
    return readFileSync(path, 'utf8').trim();
  } catch {
    return null;
  }
}

function histogram(values: (string | null)[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const v of values) {
    if (v !== null) {
      out[v] = (out[v] ?? 0) + 1;
    }
  }
  return out;
}

function temperatures(): Record<string, number> {
  const out: Record<string, number> = {};
  const base = '/sys/class/hwmon';
  if (!existsSync(base)) {
    return out;
  }
  for (const hw of readdirSync(base)) {
    const name = read(join(base, hw, 'name')) ?? hw;
    for (const f of readdirSync(join(base, hw))) {
      const m = /^temp(\d+)_input$/.exec(f);
      if (!m) {
        continue;
      }
      const label = read(join(base, hw, `temp${m[1]}_label`)) ?? `temp${m[1]}`;
      const v = Number(read(join(base, hw, f)));
      if (Number.isFinite(v)) {
        out[`${name}/${label}`] = v / 1000;
      }
    }
  }
  return out;
}

function busyBuilds(): string[] {
  try {
    const out = execFileSync('ps', ['-eo', 'comm='], { encoding: 'utf8' });
    const names = new Set(out.split('\n').map((s) => s.trim()));
    return ['ninja', 'autoninja', 'siso', 'reproxy', 'clang++', 'ld.lld', 'rustc', 'cc1plus'].filter((n) => names.has(n));
  } catch {
    return [];
  }
}

export function snapshotEnv(): EnvSnapshot {
  const cpuList = cpus();
  const cpuDirs = cpuList.map((_, i) => `/sys/devices/system/cpu/cpu${i}/cpufreq`);
  const freqs = cpuDirs.map((d) => Number(read(join(d, 'scaling_cur_freq')))).filter((f) => f > 0);
  return {
    takenAt: new Date().toISOString(),
    cpuModel: cpuList[0]?.model ?? 'unknown',
    logicalCpus: cpuList.length,
    memBytes: totalmem(),
    loadavg: loadavg(),
    governor: histogram(cpuDirs.map((d) => read(join(d, 'scaling_governor')))),
    epp: histogram(cpuDirs.map((d) => read(join(d, 'energy_performance_preference')))),
    boost: read('/sys/devices/system/cpu/cpufreq/boost'),
    smt: read('/sys/devices/system/cpu/smt/active'),
    nmiWatchdog: read('/proc/sys/kernel/nmi_watchdog'),
    perfEventParanoid: read('/proc/sys/kernel/perf_event_paranoid'),
    rdpmc: read('/sys/bus/event_source/devices/cpu/rdpmc'),
    cpuPressure: read('/proc/pressure/cpu'),
    temperatures: temperatures(),
    freqMHz: freqs.length
      ? {
          min: Math.min(...freqs) / 1000,
          max: Math.max(...freqs) / 1000,
          mean: freqs.reduce((a, b) => a + b, 0) / freqs.length / 1000,
        }
      : null,
    node: process.version,
    busyBuilds: busyBuilds(),
  };
}

export function freeBytes(path: string): number | null {
  try {
    const s = statfsSync(path);
    return s.bavail * s.bsize;
  } catch {
    return null;
  }
}
