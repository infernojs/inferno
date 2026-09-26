/**
 * mulberry32: tiny, fast, deterministic PRNG. Apps must never use Math.random,
 * otherwise rendered output (and thus layout/paint work) differs per run.
 */
export function createRandom(seed) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seed from `?seed=N` (default 1) so runs are reproducible yet variable on demand. */
export function seedFromLocation(fallback = 1) {
  const raw = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('seed') : null;
  const n = raw === null ? NaN : Number(raw);
  return Number.isFinite(n) ? n : fallback;
}
