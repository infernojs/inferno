// d8 driver for the micro suite (same cases as the Node worker). Run as
//   d8 [--expose-gc --allow-natives-syntax --expose-statistics] micro-d8.js -- <case> [iterations] [warmup] [gcEach]
// With InfernoProf's d8 (--expose-statistics), infernoBenchCounters() gives
// exact allocated bytes and user-space instructions/cycles per op.
import './install-dom.js';
import { cases } from '../cases/index.js';
import * as Inferno from 'inferno';

const shim = globalThis.__shim;
// d8 exposes script arguments (after --) as a global; inside the bundle's IIFE the bare
// name would resolve to the wrapper function's own arguments object.
const args = Array.from(globalThis.arguments ?? []);
const [caseName, itersArg, warmupArg, gcEachArg] = args;
const emit = (obj) => print(JSON.stringify(obj));
const counters = typeof infernoBenchCounters === 'function' ? infernoBenchCounters : null;

function checkMaps() {
  const haveSameMap = new Function('a', 'b', 'return %HaveSameMap(a, b)');
  const el = Inferno.createVNode(1, 'div', null, null, 1, null, null, null);
  const mounted = Inferno.createVNode(1, 'div', 'x', Inferno.createTextVNode('t', null), 2, null, null, null);
  Inferno.render(mounted, document.createElement('div'));
  const samples = {
    createTextVNode: Inferno.createTextVNode('x', null),
    'createComponentVNode(fn)': Inferno.createComponentVNode(8, () => null, {}, null, null),
    createFragment: Inferno.createFragment([Inferno.createTextVNode('a', null)], 4, null),
    directClone: Inferno.directClone(el),
    'after mount': mounted,
  };
  const out = {};
  for (const [name, v] of Object.entries(samples)) {
    out[name] = haveSameMap(el, v);
  }
  return out;
}

if (caseName === '@list') {
  emit({ version: Inferno.version, cases: Object.keys(cases) });
} else if (caseName === '@maps') {
  emit({ version: Inferno.version, maps: checkMaps() });
} else {
  const c = cases[caseName];
  if (!c) {
    throw new Error(`Unknown case ${caseName}`);
  }
  const iterations = Number(itersArg) || c.iterations;
  const warmup = warmupArg !== undefined && warmupArg !== '' ? Number(warmupArg) : c.warmup;
  const gcEach = gcEachArg === '1' && typeof gc === 'function';

  c.setup();
  for (let i = 0; i < warmup; i++) {
    c.prepare(i);
    c.op(i);
  }

  // Cost of an empty counter bracket (the probe's own work and result array).
  let probe = null;
  if (counters) {
    const d = [];
    for (let i = 0; i < 64; i++) {
      const a = counters();
      const b = counters();
      d.push(b.map((v, j) => v - a[j]));
    }
    probe = d[0].map((_, j) => d.map((x) => x[j]).sort((x, y) => x - y)[d.length >> 1]);
  }

  const timesNs = [];
  const allocBytes = [];
  const instructions = [];
  const cycles = [];
  const gcIterations = [];
  const domTotals = {};
  for (let i = 0; i < iterations; i++) {
    const it = warmup + i;
    c.prepare(it);
    if (gcEach) {
      gc();
    }
    shim.resetCounts();
    const c0 = counters ? counters() : null;
    const t0 = performance.now();
    c.op(it);
    const t1 = performance.now();
    const c1 = counters ? counters() : null;
    timesNs.push((t1 - t0) * 1e6);
    if (c0 && c1) {
      allocBytes.push(c1[0] - c0[0] - probe[0]);
      if (c1[1] !== c0[1]) {
        gcIterations.push(i);
      }
      if (c0[2] >= 0) {
        instructions.push(c1[2] - c0[2] - probe[2]);
        cycles.push(c1[3] - c0[3] - probe[3]);
      }
    }
    for (const [k, v] of Object.entries(shim.snapshotCounts())) {
      domTotals[k] = (domTotals[k] ?? 0) + v;
    }
  }
  const root = c.root?.();
  emit({
    version: Inferno.version,
    runtime: 'd8',
    case: caseName,
    iterations,
    warmup,
    timesNs,
    allocBytes,
    instructions,
    cycles,
    allocSites: [],
    gc: { count: gcIterations.length, timeMs: 0, iterationsWithGc: gcIterations },
    domTotals,
    checksum: root ? shim.fnv(root.innerHTML) : c.output ? shim.fnv(c.output()) : null,
  });
}
