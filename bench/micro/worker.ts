/**
 * Runs one micro case of one variant bundle in a fresh process and prints a
 * JSON result line. One process per (variant, case) keeps type feedback and
 * heap state from leaking between cases or variants.
 *
 *   node --expose-gc --allow-natives-syntax micro/worker.ts <bundle> <case> [iterations] [warmup] [gcEach]
 *   node ... micro/worker.ts <bundle> @list
 *   node ... micro/worker.ts <bundle> @maps
 */
import { Session } from 'node:inspector';
import { PerformanceObserver, performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';
import * as shim from './dom-shim.js';

const [bundle, caseName, itersArg, warmupArg, gcEachArg] = process.argv.slice(2);

// INFERNO_BENCH_DOM=jsdom swaps in jsdom to cross-check the shim's semantics.
if (process.env.INFERNO_BENCH_DOM === 'jsdom') {
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
  const g = globalThis as any;
  g.window = dom.window;
  g.document = dom.window.document;
  g.Node = dom.window.Node;
  g.Event = dom.window.Event;
  g.MouseEvent = dom.window.MouseEvent;
  g.__shim = { ...shim, click: (el: any) => el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })) };
} else {
  shim.installDom();
  (globalThis as any).__shim = shim;
}
const mod = await import(pathToFileURL(bundle).href);

function emit(result: unknown): void {
  process.stdout.write(JSON.stringify(result) + '\n');
}

/**
 * Exact allocation measurement. v8.getHeapStatistics().total_allocated_bytes is
 * useless per op: each call retires the linear allocation buffer, so the next
 * allocation counts a whole fresh buffer (~100 KB). The sampling heap profiler
 * with an 8-byte interval, including objects already collected by GC, instead
 * reports every allocation with its size and allocating function.
 */
const session = new Session();
session.connect();
function post(method: string, params: object = {}): any {
  let result: any;
  let error: any;
  session.post(method, params, (e, r) => {
    error = e;
    result = r;
  });
  if (error) {
    throw error;
  }
  return result;
}
post('HeapProfiler.enable');

interface AllocSample {
  bytes: number;
  sites: Map<string, number>;
}

function sampleAllocations(fn: () => void): AllocSample {
  post('HeapProfiler.startSampling', {
    samplingInterval: 8,
    includeObjectsCollectedByMajorGC: true,
    includeObjectsCollectedByMinorGC: true,
  });
  fn();
  const { profile } = post('HeapProfiler.stopSampling');
  const sites = new Map<string, number>();
  let bytes = 0;
  const walk = (node: any) => {
    if (node.selfSize > 0) {
      bytes += node.selfSize;
      const f = node.callFrame;
      const where = f.url ? `${f.url.split('/').pop()}:${f.lineNumber + 1}` : '';
      const key = `${f.functionName || '(anonymous)'} ${where}`.trim();
      sites.set(key, (sites.get(key) ?? 0) + node.selfSize);
    }
    for (const c of node.children) {
      walk(c);
    }
  };
  walk(profile.head);
  return { bytes, sites };
}

/** Hidden-class consistency of vNodes produced by every creation path. */
function checkMaps(): Record<string, boolean> {
  const haveSameMap = new Function('a', 'b', 'return %HaveSameMap(a, b)') as (a: object, b: object) => boolean;
  const I = mod.Inferno;
  const el = I.createVNode(1, 'div', null, null, 1, null, null, null);
  class C extends I.Component {
    render() {
      return null;
    }
  }
  const container = document.createElement('div');
  const mounted = I.createVNode(1, 'div', 'x', I.createTextVNode('t', null), 2, null, null, null);
  I.render(mounted, container);
  const normalizedParent = I.createVNode(1, 'div', null, ['a', null, [I.createVNode(1, 'b', null, null, 1, null, null, null)]], 0, null, null, null);
  const samples: Record<string, object> = {
    'createVNode+children': I.createVNode(1, 'div', 'c', [el], 4, { id: 'x' }, 'k', null),
    createTextVNode: I.createTextVNode('x', null),
    'createComponentVNode(fn)': I.createComponentVNode(8, () => null, {}, null, null),
    'createComponentVNode(class)': I.createComponentVNode(4, C, {}, null, null),
    createFragment: I.createFragment([I.createTextVNode('a', null)], 4, null),
    directClone: I.directClone(el),
    'normalized child': normalizedParent.children[0],
    'after mount': mounted,
    'after mount (text child)': mounted.children,
  };
  const out: Record<string, boolean> = {};
  for (const [name, v] of Object.entries(samples)) {
    out[name] = haveSameMap(el, v);
  }
  return out;
}

if (caseName === '@fuzz-trace') {
  // Serialized DOM after every step of a fuzz sequence, for shim-vs-jsdom checks.
  const [seed, steps] = [Number(itersArg), Number(warmupArg)];
  const container = document.createElement('div');
  document.body.appendChild(container);
  const trace: string[] = [];
  for (let step = 0; step <= steps; step++) {
    mod.renderFuzzStep(seed, step, container);
    trace.push(container.innerHTML);
  }
  emit({ version: mod.version, trace });
} else if (caseName === '@list') {
  emit({ version: mod.version, cases: Object.keys(mod.cases) });
} else if (caseName === '@maps') {
  emit({ version: mod.version, maps: checkMaps() });
} else {
  const c = mod.cases[caseName];
  if (!c) {
    throw new Error(`Unknown case ${caseName}`);
  }
  const iterations = Number(itersArg) || c.iterations;
  const warmup = Number(warmupArg) >= 0 && warmupArg !== undefined ? Number(warmupArg) : c.warmup;
  const gcEach = gcEachArg === '1';
  const gc = (globalThis as any).gc as (() => void) | undefined;

  const gcEntries: { start: number; duration: number }[] = [];
  const obs = new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      gcEntries.push({ start: e.startTime, duration: e.duration });
    }
  });
  obs.observe({ entryTypes: ['gc'] });

  c.setup();
  for (let i = 0; i < warmup; i++) {
    c.prepare(i);
    c.op(i);
  }

  const canary = () => ((globalThis as any).__infernoCanaryCalls as number | undefined) ?? 0;
  let canaryCalls = 0;
  const timesNs: number[] = [];
  const windows: [number, number][] = [];
  const domTotals: Record<string, number> = {};
  let firstDom: Record<string, number> | null = null;
  for (let i = 0; i < iterations; i++) {
    const it = warmup + i;
    c.prepare(it);
    if (gcEach && gc) {
      gc();
    }
    shim.resetCounts();
    const c0 = canary();
    const w0 = performance.now();
    const t0 = process.hrtime.bigint();
    c.op(it);
    const t1 = process.hrtime.bigint();
    const w1 = performance.now();
    canaryCalls += canary() - c0;
    timesNs.push(Number(t1 - t0));
    windows.push([w0, w1]);
    const counts = shim.snapshotCounts() as Record<string, number>;
    firstDom ??= counts;
    for (const [k, v] of Object.entries(counts)) {
      domTotals[k] = (domTotals[k] ?? 0) + (v as number);
    }
  }

  // GC entries are delivered asynchronously.
  await new Promise((r) => setTimeout(r, 20));
  obs.disconnect();
  let gcInWindow = 0;
  let gcTimeInWindow = 0;
  const gcIters = new Set<number>();
  for (const g of gcEntries) {
    const idx = windows.findIndex(([s, e]) => g.start >= s && g.start <= e);
    if (idx !== -1) {
      gcInWindow++;
      gcTimeInWindow += g.duration;
      gcIters.add(idx);
    }
  }

  // Allocation pass after timing (profiling overhead never touches timings).
  // Checksums are taken first because extra iterations change the DOM.
  const root = c.root?.();
  // Browsers/jsdom normalize CSS values on serialization (e.g. "rgba(0, 0, 0, 1)");
  // the shim keeps raw values, so cross-DOM checks compare style text without spaces.
  const normalize = (html: string) =>
    process.env.INFERNO_BENCH_NORMALIZE_STYLE ? html.replace(/style="([^"]*)"/g, (_m, v) => `style="${v.replace(/\s+/g, '')}"`) : html;
  const checksum = root ? shim.fnv(normalize(root.innerHTML)) : c.output ? shim.fnv(c.output()) : null;
  const probe: number[] = [0];
  for (let i = 0; i < (Number(process.env.INFERNO_BENCH_ALLOC_ITERS ?? 20) > 0 ? 16 : 0); i++) {
    probe.push(sampleAllocations(() => {}).bytes);
  }
  probe.sort((a, b) => a - b);
  const probeBytes = probe[probe.length >> 1];
  const allocIterations = Math.min(iterations, Number(process.env.INFERNO_BENCH_ALLOC_ITERS ?? 20));
  // The probe/alloc pass is skipped entirely when INFERNO_BENCH_ALLOC_ITERS=0.
  const allocBytes: number[] = [];
  const allocSites = new Map<string, number>();
  for (let i = 0; i < allocIterations; i++) {
    const it = warmup + iterations + i;
    c.prepare(it);
    const sample = sampleAllocations(() => c.op(it));
    allocBytes.push(sample.bytes - probeBytes);
    for (const [k, v] of sample.sites) {
      allocSites.set(k, (allocSites.get(k) ?? 0) + v);
    }
  }
  const topSites = [...allocSites.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([site, bytes]) => ({ site, bytesPerOp: bytes / allocIterations }));

  emit({
    version: mod.version,
    case: caseName,
    iterations,
    warmup,
    timesNs,
    allocBytes,
    allocProbeBytes: probeBytes,
    canaryCallsPerOp: canaryCalls / iterations,
    allocSites: topSites,
    gc: { count: gcInWindow, timeMs: gcTimeInWindow, iterationsWithGc: [...gcIters] },
    domTotals,
    firstDom,
    checksum,
  });
}
