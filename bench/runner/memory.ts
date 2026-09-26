import type { PageSession } from './session.ts';

export interface MemoryMetrics {
  /** V8 JS heap used after two full GCs (bytes). */
  jsHeap: number;
  /** Blink/Oilpan (cppgc) heap reported to V8 as embedder memory (bytes). */
  embedderHeap: number;
  /** Array buffer backing stores (bytes). */
  backingStorage: number;
  /** js-framework-benchmark 21/22/25 metric: measureUserAgentSpecificMemory (bytes). */
  uaMemory: number | null;
  /** DOM/listener counters from Memory.getDOMCountersForLeakDetection. */
  counters: Record<string, number>;
  /** Heap snapshot: count and self size per constructor/type (top entries). */
  heapObjects?: { name: string; count: number; selfSize: number }[];
}

async function fullGc(s: PageSession): Promise<void> {
  await s.cdp.send('HeapProfiler.collectGarbage');
  await s.cdp.send('HeapProfiler.collectGarbage');
}

/** Aggregates a V8 heap snapshot by node name (constructor) for object-like node types. */
function aggregateSnapshot(snapshot: any, top: number): { name: string; count: number; selfSize: number }[] {
  const meta = snapshot.snapshot.meta;
  const fields: string[] = meta.node_fields;
  const types: string[] = meta.node_types[0];
  const stride = fields.length;
  const iType = fields.indexOf('type');
  const iName = fields.indexOf('name');
  const iSize = fields.indexOf('self_size');
  const nodes: number[] = snapshot.nodes;
  const strings: string[] = snapshot.strings;
  const byName = new Map<string, { count: number; selfSize: number }>();
  for (let i = 0; i < nodes.length; i += stride) {
    const type = types[nodes[i + iType]];
    let name: string;
    if (type === 'object' || type === 'native') {
      name = strings[nodes[i + iName]];
    } else if (type === 'closure' || type === 'array' || type === 'string' || type === 'number' || type === 'code') {
      name = `(${type})`;
    } else {
      continue;
    }
    const e = byName.get(name) ?? { count: 0, selfSize: 0 };
    e.count++;
    e.selfSize += nodes[i + iSize];
    byName.set(name, e);
  }
  return [...byName.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.selfSize - a.selfSize)
    .slice(0, top);
}

async function takeSnapshot(s: PageSession): Promise<any> {
  const chunks: string[] = [];
  const onChunk = (e: { chunk: string }) => chunks.push(e.chunk);
  s.cdp.on('HeapProfiler.addHeapSnapshotChunk', onChunk);
  try {
    await s.cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false, captureNumericValue: false } as any);
  } finally {
    s.cdp.off('HeapProfiler.addHeapSnapshotChunk', onChunk);
  }
  return JSON.parse(chunks.join(''));
}

export async function measureMemory(s: PageSession, snapshot: boolean): Promise<MemoryMetrics> {
  await s.cdp.send('HeapProfiler.enable');
  await fullGc(s);
  const usage = (await s.cdp.send('Runtime.getHeapUsage')) as any;
  const leak = (await s.cdp.send('Memory.getDOMCountersForLeakDetection' as any)) as any;
  const counters: Record<string, number> = {};
  for (const c of leak.counters ?? []) {
    counters[c.name] = c.count;
  }
  // Listener counts only come from the older API.
  const dom = (await s.cdp.send('Memory.getDOMCounters')) as any;
  counters.jsEventListeners = dom.jsEventListeners;
  let uaMemory: number | null = null;
  try {
    uaMemory = await s.evaluate<number>(`performance.measureUserAgentSpecificMemory().then((m) => m.bytes)`);
  } catch {
    uaMemory = null;
  }
  const out: MemoryMetrics = {
    jsHeap: usage.usedSize,
    embedderHeap: usage.embedderHeapUsedSize ?? 0,
    backingStorage: usage.backingStorageSize ?? 0,
    uaMemory,
    counters,
  };
  if (snapshot) {
    out.heapObjects = aggregateSnapshot(await takeSnapshot(s), 40);
  }
  return out;
}
