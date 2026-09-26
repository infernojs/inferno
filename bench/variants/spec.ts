/**
 * Variant grammar:  <base>[+<canary>]*
 *   base   := local | src:<git-ref> | npm:<version>
 *   canary := spin:<fn>:<n>us    busy-waits n microseconds per call of <fn>
 *           | alloc:<fn>:<n>     allocates a packed array of n elements per call
 *           | domop:<fn>         performs one extra setAttribute per call
 *
 * Canaries are injected into the prod ESM bundle of `inferno` so every
 * measurement mode can be validated against a known, sized effect.
 *
 * A trailing @tag (e.g. local@A,local@B) makes otherwise identical variants
 * distinct for A/A runs; tagged variants share the same build.
 */

export type BaseSpec = { kind: 'local' } | { kind: 'src'; ref: string } | { kind: 'npm'; version: string };

export type Canary =
  | { kind: 'spin'; fn: string; micros: number }
  | { kind: 'alloc'; fn: string; elements: number }
  | { kind: 'domop'; fn: string };

export interface VariantSpec {
  raw: string;
  /** File-system safe identifier, unique per spec. */
  id: string;
  baseId: string;
  base: BaseSpec;
  canaries: Canary[];
}

const SAFE = /[^A-Za-z0-9._-]/g;

function parseBase(raw: string): BaseSpec {
  if (raw === 'local') {
    return { kind: 'local' };
  }
  if (raw.startsWith('src:') && raw.length > 4) {
    return { kind: 'src', ref: raw.slice(4) };
  }
  if (raw.startsWith('npm:') && raw.length > 4) {
    return { kind: 'npm', version: raw.slice(4) };
  }
  throw new Error(`Unknown variant base "${raw}" (expected local, src:<ref> or npm:<version>)`);
}

function parseCanary(raw: string): Canary {
  const [kind, fn, amount] = raw.split(':');
  if (!fn || !/^[A-Za-z_$][\w$]*$/.test(fn)) {
    throw new Error(`Canary "${raw}" needs a function name`);
  }
  switch (kind) {
    case 'spin': {
      const m = /^(\d+(?:\.\d+)?)us$/.exec(amount ?? '');
      if (!m) {
        throw new Error(`Spin canary "${raw}" needs a duration like 20us`);
      }
      return { kind, fn, micros: Number(m[1]) };
    }
    case 'alloc': {
      const n = Number(amount);
      if (!Number.isInteger(n) || n <= 0) {
        throw new Error(`Alloc canary "${raw}" needs a positive element count`);
      }
      return { kind, fn, elements: n };
    }
    case 'domop':
      return { kind, fn };
    default:
      throw new Error(`Unknown canary kind "${kind}"`);
  }
}

export function baseIdOf(base: BaseSpec): string {
  switch (base.kind) {
    case 'local':
      return 'local';
    case 'src':
      return `src-${base.ref.replace(SAFE, '_')}`;
    case 'npm':
      return `npm-${base.version.replace(SAFE, '_')}`;
  }
}

export function canaryId(c: Canary): string {
  switch (c.kind) {
    case 'spin':
      return `spin-${c.fn}-${c.micros}us`;
    case 'alloc':
      return `alloc-${c.fn}-${c.elements}`;
    case 'domop':
      return `domop-${c.fn}`;
  }
}

export function parseVariant(raw: string): VariantSpec {
  const at = raw.lastIndexOf('@');
  const tag = at > 0 && /^[A-Za-z0-9_-]+$/.test(raw.slice(at + 1)) ? raw.slice(at + 1) : null;
  const body = tag ? raw.slice(0, at) : raw;
  const [baseRaw, ...canaryRaw] = body.split('+');
  const base = parseBase(baseRaw);
  const canaries = canaryRaw.map(parseCanary);
  const baseId = baseIdOf(base);
  const id = [baseId, ...canaries.map(canaryId)].join('+') + (tag ? `@${tag}` : '');
  return { raw, id, baseId, base, canaries };
}

export function parseVariantList(raw: string | undefined, fallback = 'local'): VariantSpec[] {
  const list = (raw ?? fallback)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseVariant);
  const seen = new Set<string>();
  for (const v of list) {
    if (seen.has(v.id)) {
      throw new Error(`Variant "${v.raw}" listed twice`);
    }
    seen.add(v.id);
  }
  return list;
}
