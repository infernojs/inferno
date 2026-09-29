import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import type { CDPSession } from 'puppeteer-core';

/**
 * allocsites mode: V8's sampling heap profiler over the op and its window, with collected
 * objects included, so the profile estimates bytes allocated (not retained). Allocations are
 * charged to the nearest frame with a script (builtins belong to their caller) and mapped through
 * the app's hidden source map to the original function, so minified bundles attribute too.
 */
export const SAMPLING_INTERVAL = 64;

export type Pkg = 'inferno' | 'animation' | 'app' | 'harness' | 'other' | 'native';

export interface SiteSample {
  total: number;
  byPackage: Record<Pkg, number>;
  /** "pkg function (source:line)" -> bytes; the 60 largest. */
  sites: Record<string, number>;
}

export async function startSampling(cdp: CDPSession): Promise<void> {
  await cdp.send('HeapProfiler.enable');
  await cdp.send('HeapProfiler.startSampling', {
    samplingInterval: SAMPLING_INTERVAL,
    includeObjectsCollectedByMajorGC: true,
    includeObjectsCollectedByMinorGC: true,
  });
}

const maps = new Map<string, TraceMap | null>();

function mapFor(appDir: string): TraceMap | null {
  if (!maps.has(appDir)) {
    const file = join(appDir, 'main.js.map');
    maps.set(appDir, existsSync(file) ? new TraceMap(readFileSync(file, 'utf8')) : null);
  }
  return maps.get(appDir)!;
}

function packageOf(source: string): Pkg {
  // App sources first: the lab itself lives in a checkout named inferno
  if (/\/bench\/apps\//.test(source)) {
    return 'app';
  }
  if (/inferno-animation\//.test(source)) {
    return 'animation';
  }
  if (/(^|\/)(inferno|inferno-shared|inferno-vnode-flags|inferno-hydrate)\//.test(source)) {
    return 'inferno';
  }
  return 'other';
}

export async function stopSampling(cdp: CDPSession, appDir: string): Promise<SiteSample> {
  const { profile } = (await cdp.send('HeapProfiler.stopSampling')) as any;
  await cdp.send('HeapProfiler.disable');
  const map = mapFor(appDir);
  const byPackage: Record<Pkg, number> = { inferno: 0, animation: 0, app: 0, harness: 0, other: 0, native: 0 };
  const sites = new Map<string, number>();
  let total = 0;
  const resolve = (f: any): { pkg: Pkg; key: string } => {
    if (/^__bench/.test(f.functionName) || !f.url.endsWith('main.js')) {
      return { pkg: 'harness', key: `harness ${f.functionName || '(anonymous)'}` };
    }
    const pos = map ? originalPositionFor(map, { line: f.lineNumber + 1, column: f.columnNumber }) : null;
    if (!pos || !pos.source) {
      return { pkg: 'other', key: `other ${f.functionName || '(anonymous)'} main.js:${f.lineNumber + 1}` };
    }
    const pkg = packageOf(pos.source);
    const file = pos.source.replace(/^.*\/(packages|apps|variants\/[^/]+)\//, '');
    return { pkg, key: `${pkg} ${pos.name ?? f.functionName ?? '(anonymous)'} (${file}:${pos.line})` };
  };
  const walk = (node: any, owner: { pkg: Pkg; key: string } | null) => {
    const f = node.callFrame;
    // The session instrumentation is an injected script without a url
    const here = /^__bench/.test(f.functionName) ? { pkg: 'harness' as Pkg, key: `harness ${f.functionName}` } : f.url ? resolve(f) : owner;
    if (node.selfSize > 0) {
      const at = here ?? { pkg: 'native' as Pkg, key: `native ${f.functionName || '(root)'}` };
      byPackage[at.pkg] += node.selfSize;
      sites.set(at.key, (sites.get(at.key) ?? 0) + node.selfSize);
      total += node.selfSize;
    }
    for (const c of node.children) {
      walk(c, here);
    }
  };
  walk(profile.head, null);
  const top = [...sites].sort((a, b) => b[1] - a[1]).slice(0, 60);
  return { total, byPackage, sites: Object.fromEntries(top) };
}

/** Mean bytes per op of every site over the samples (a site missing in a sample counts 0). */
export function meanSites(samples: SiteSample[]): [string, number][] {
  const sum = new Map<string, number>();
  for (const s of samples) {
    for (const [k, v] of Object.entries(s.sites)) {
      sum.set(k, (sum.get(k) ?? 0) + v);
    }
  }
  return [...sum].map(([k, v]) => [k, v / samples.length] as [string, number]).sort((a, b) => b[1] - a[1]);
}
