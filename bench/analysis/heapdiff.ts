/**
 * Heap snapshot analysis for leak checks.
 *
 * Three snapshots taken in the same page (V8 keeps object ids stable while the
 * HeapProfiler domain stays enabled): objects first seen in S2 and still alive
 * in S3 were allocated during the S1→S2 window and survived another window.
 * Anything the framework leaks per cycle shows up here, grouped by type and
 * constructor, with the shortest retaining path from the GC roots.
 */

export interface Snapshot {
  nodeFields: number;
  iType: number;
  iName: number;
  iId: number;
  iSelfSize: number;
  iEdgeCount: number;
  nodeTypes: string[];
  edgeFields: number;
  iEdgeType: number;
  iEdgeName: number;
  iEdgeTo: number;
  edgeTypes: string[];
  nodes: Float64Array;
  edges: Uint32Array;
  strings: string[];
  /** Index (in node units) of each node's first edge. */
  firstEdge: Uint32Array;
  nodeCount: number;
}

export function parseSnapshot(json: any): Snapshot {
  const meta = json.snapshot.meta;
  const nf: string[] = meta.node_fields;
  const ef: string[] = meta.edge_fields;
  const nodes = Float64Array.from(json.nodes as number[]);
  const edges = Uint32Array.from(json.edges as number[]);
  const nodeFields = nf.length;
  const nodeCount = nodes.length / nodeFields;
  const iEdgeCount = nf.indexOf('edge_count');
  const firstEdge = new Uint32Array(nodeCount + 1);
  for (let n = 0, e = 0; n < nodeCount; n++) {
    firstEdge[n] = e;
    e += nodes[n * nodeFields + iEdgeCount];
    firstEdge[n + 1] = e;
  }
  return {
    nodeFields,
    iType: nf.indexOf('type'),
    iName: nf.indexOf('name'),
    iId: nf.indexOf('id'),
    iSelfSize: nf.indexOf('self_size'),
    iEdgeCount,
    nodeTypes: meta.node_types[0],
    edgeFields: ef.length,
    iEdgeType: ef.indexOf('type'),
    iEdgeName: ef.indexOf('name_or_index'),
    iEdgeTo: ef.indexOf('to_node'),
    edgeTypes: meta.edge_types[0],
    nodes,
    edges,
    strings: json.strings,
    firstEdge,
    nodeCount,
  };
}

function nodeType(s: Snapshot, n: number): string {
  return s.nodeTypes[s.nodes[n * s.nodeFields + s.iType]];
}

function nodeName(s: Snapshot, n: number): string {
  return s.strings[s.nodes[n * s.nodeFields + s.iName]];
}

function nodeId(s: Snapshot, n: number): number {
  return s.nodes[n * s.nodeFields + s.iId];
}

function selfSize(s: Snapshot, n: number): number {
  return s.nodes[n * s.nodeFields + s.iSelfSize];
}

/** Grouping key: constructor or class name for objects, the node type otherwise. */
export function groupOf(s: Snapshot, n: number): string {
  const type = nodeType(s, n);
  const name = nodeName(s, n);
  switch (type) {
    case 'object':
    case 'native':
      return name;
    case 'closure':
      return `(closure) ${name || '(anonymous)'}`;
    case 'hidden':
    case 'object shape':
      return `(system) ${name.replace(/^system \/ /, '')}`;
    case 'code':
      return '(code)';
    default:
      return `(${type})`;
  }
}

export function maxId(s: Snapshot): number {
  let max = 0;
  for (let n = 0; n < s.nodeCount; n++) {
    const id = nodeId(s, n);
    if (id > max) {
      max = id;
    }
  }
  return max;
}

export interface GroupStat {
  group: string;
  count: number;
  bytes: number;
}

export function groupStats(s: Snapshot, filter: (n: number) => boolean = () => true): Map<string, GroupStat> {
  const out = new Map<string, GroupStat>();
  for (let n = 0; n < s.nodeCount; n++) {
    if (!filter(n)) {
      continue;
    }
    const g = groupOf(s, n);
    const e = out.get(g) ?? { group: g, count: 0, bytes: 0 };
    e.count++;
    e.bytes += selfSize(s, n);
    out.set(g, e);
  }
  return out;
}

/**
 * Shortest retaining path from the GC roots to every node, ignoring weak
 * edges (BFS from the synthetic root, node 0).
 */
function shortestParents(s: Snapshot): { parentNode: Int32Array; parentEdge: Int32Array } {
  const parentNode = new Int32Array(s.nodeCount).fill(-1);
  const parentEdge = new Int32Array(s.nodeCount).fill(-1);
  const weak = s.edgeTypes.indexOf('weak');
  const queue = new Int32Array(s.nodeCount);
  let head = 0;
  let tail = 0;
  queue[tail++] = 0;
  parentNode[0] = 0;
  while (head < tail) {
    const n = queue[head++];
    for (let e = s.firstEdge[n]; e < s.firstEdge[n + 1]; e++) {
      const base = e * s.edgeFields;
      if (s.edges[base + s.iEdgeType] === weak) {
        continue;
      }
      const to = s.edges[base + s.iEdgeTo] / s.nodeFields;
      if (parentNode[to] === -1) {
        parentNode[to] = n;
        parentEdge[to] = e;
        queue[tail++] = to;
      }
    }
  }
  return { parentNode, parentEdge };
}

function edgeLabel(s: Snapshot, e: number): string {
  const base = e * s.edgeFields;
  const type = s.edgeTypes[s.edges[base + s.iEdgeType]];
  const nameOrIndex = s.edges[base + s.iEdgeName];
  if (type === 'element' || type === 'hidden') {
    return `[${nameOrIndex}]`;
  }
  const name = s.strings[nameOrIndex];
  return type === 'context' ? `(context) ${name}` : type === 'internal' ? `(internal) ${name}` : `.${name}`;
}

function describe(s: Snapshot, n: number): string {
  const type = nodeType(s, n);
  const name = nodeName(s, n);
  if (type === 'string' || type === 'concatenated string' || type === 'sliced string') {
    return `"${name.slice(0, 40)}"`;
  }
  return `${groupOf(s, n)}${type === 'object' || type === 'native' ? '' : name && type !== 'code' ? ` ${name.slice(0, 40)}` : ''}`;
}

export function retainerPath(s: Snapshot, parents: ReturnType<typeof shortestParents>, n: number, maxHops = 8): string {
  const hops: string[] = [];
  let cur = n;
  while (cur > 0 && hops.length < 64) {
    const p = parents.parentNode[cur];
    if (p < 0) {
      return '(unreachable)';
    }
    hops.push(`${edgeLabel(s, parents.parentEdge[cur])} → ${describe(s, cur)}`);
    cur = p;
  }
  hops.reverse();
  const shown = hops.length > maxHops ? ['…', ...hops.slice(-maxHops)] : hops;
  return shown.join(' ');
}

export interface SurvivorGroup extends GroupStat {
  /** Shortest retaining paths of up to three members. */
  paths: string[];
}

export interface LeakAnalysis {
  /** Heap totals of the three snapshots (bytes, objects). */
  totals: { bytes: number; count: number }[];
  /** Objects allocated between S1 and S2 that are still alive in S3. */
  survivors: SurvivorGroup[];
  survivorBytes: number;
  survivorCount: number;
  /** Per-group growth over each window, from full-snapshot group totals. */
  growth: { group: string; d12: number; d23: number; c12: number; c23: number }[];
}

export function analyzeLeak(s1: Snapshot, s2: Snapshot, s3: Snapshot, top = 25): LeakAnalysis {
  const id1 = maxId(s1);
  const id2 = maxId(s2);
  const isSurvivor = (n: number) => {
    const id = nodeId(s3, n);
    return id > id1 && id <= id2;
  };
  const groups = groupStats(s3, isSurvivor);
  const parents = shortestParents(s3);
  const members = new Map<string, number[]>();
  for (let n = 0; n < s3.nodeCount; n++) {
    if (isSurvivor(n)) {
      const g = groupOf(s3, n);
      const list = members.get(g) ?? [];
      if (list.length < 3) {
        list.push(n);
        members.set(g, list);
      }
    }
  }
  const survivors = [...groups.values()]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, top)
    .map((g) => ({ ...g, paths: (members.get(g.group) ?? []).map((n) => retainerPath(s3, parents, n)) }));
  let survivorBytes = 0;
  let survivorCount = 0;
  for (const g of groups.values()) {
    survivorBytes += g.bytes;
    survivorCount += g.count;
  }
  const t = [s1, s2, s3].map((s) => groupStats(s));
  const names = new Set([...t[0].keys(), ...t[1].keys(), ...t[2].keys()]);
  const zero = { bytes: 0, count: 0 };
  const growth = [...names]
    .map((group) => {
      const [a, b, c] = t.map((m) => m.get(group) ?? zero);
      return { group, d12: b.bytes - a.bytes, d23: c.bytes - b.bytes, c12: b.count - a.count, c23: c.count - b.count };
    })
    .filter((g) => g.d12 !== 0 || g.d23 !== 0 || g.c12 !== 0 || g.c23 !== 0)
    .sort((a, b) => Math.abs(b.d12) + Math.abs(b.d23) - (Math.abs(a.d12) + Math.abs(a.d23)))
    .slice(0, top);
  const totals = t.map((m) => {
    let bytes = 0;
    let count = 0;
    for (const g of m.values()) {
      bytes += g.bytes;
      count += g.count;
    }
    return { bytes, count };
  });
  return { totals, survivors, survivorBytes, survivorCount, growth };
}
