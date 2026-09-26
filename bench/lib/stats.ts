/**
 * Statistics for benchmark comparisons.
 *
 * Unit of replication is the block (one process or one browser launch): most
 * variance comes from per-launch effects (code layout, JIT timing, clocks), so
 * comparisons use per-block medians rather than pooling every iteration.
 */

export function sorted(xs: number[]): number[] {
  return xs.slice().sort((a, b) => a - b);
}

export function quantile(xs: number[], q: number): number {
  if (xs.length === 0) {
    return NaN;
  }
  const s = sorted(xs);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

export const median = (xs: number[]) => quantile(xs, 0.5);

export function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function stddev(xs: number[]): number {
  if (xs.length < 2) {
    return 0;
  }
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
}

/** Median absolute deviation scaled to be a consistent sigma estimator. */
export function mad(xs: number[]): number {
  const m = median(xs);
  return 1.4826 * median(xs.map((x) => Math.abs(x - m)));
}

export interface Summary {
  n: number;
  median: number;
  mean: number;
  p10: number;
  p90: number;
  min: number;
  max: number;
  /** Robust coefficient of variation: MAD / median. */
  rcv: number;
}

export function summarize(xs: number[]): Summary {
  const m = median(xs);
  return {
    n: xs.length,
    median: m,
    mean: mean(xs),
    p10: quantile(xs, 0.1),
    p90: quantile(xs, 0.9),
    min: Math.min(...xs),
    max: Math.max(...xs),
    rcv: m === 0 ? 0 : mad(xs) / Math.abs(m),
  };
}

/** Deterministic PRNG for resampling so reports are reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hodges-Lehmann estimate of the shift b - a: median of all pairwise differences. */
export function hodgesLehmann(a: number[], b: number[]): number {
  const diffs: number[] = [];
  for (const x of a) {
    for (const y of b) {
      diffs.push(y - x);
    }
  }
  return median(diffs);
}

export interface ShiftEstimate {
  /** Hodges-Lehmann shift (b - a) in the metric's unit. */
  shift: number;
  /** Shift relative to median(a), in percent. */
  pct: number;
  /** Exact distribution-free 95% interval of pct (Moses / Mann-Whitney). */
  ciLow: number;
  ciHigh: number;
  /** Two-sided exact Mann-Whitney p-value. */
  p: number;
  /** Interval excludes zero. */
  significant: boolean;
}

const uCache = new Map<string, Float64Array>();

/**
 * Exact null distribution of the Mann-Whitney U statistic for sample sizes
 * m and n, as cumulative probabilities P(U <= u) for u = 0..m*n.
 */
function uCdf(m: number, n: number): Float64Array {
  const key = `${Math.min(m, n)}x${Math.max(m, n)}`;
  const cached = uCache.get(key);
  if (cached) {
    return cached;
  }
  // f(i, j, u): number of arrangements of i x's and j y's with statistic u.
  let prev: Float64Array[] = Array.from({ length: n + 1 }, () => new Float64Array(m * n + 1));
  for (let j = 0; j <= n; j++) {
    prev[j][0] = 1;
  }
  for (let i = 1; i <= m; i++) {
    const cur: Float64Array[] = Array.from({ length: n + 1 }, () => new Float64Array(m * n + 1));
    cur[0][0] = 1;
    for (let j = 1; j <= n; j++) {
      for (let u = 0; u <= i * j; u++) {
        cur[j][u] = (u >= j ? prev[j][u - j] : 0) + cur[j - 1][u];
      }
    }
    prev = cur;
  }
  const counts = prev[n];
  let total = 0;
  for (const c of counts) {
    total += c;
  }
  const cdf = new Float64Array(m * n + 1);
  let acc = 0;
  for (let u = 0; u <= m * n; u++) {
    acc += counts[u];
    cdf[u] = acc / total;
  }
  uCache.set(key, cdf);
  return cdf;
}

/**
 * Shift of b relative to a: Hodges-Lehmann estimate with the exact Moses
 * confidence interval (order statistics of the m*n pairwise differences) and
 * the exact two-sided Mann-Whitney p-value. Coverage holds for any continuous
 * distribution, which bootstrap intervals do not guarantee with 3-10 blocks.
 */
export function shift(a: number[], b: number[], alpha = 0.05): ShiftEstimate {
  const m = a.length;
  const n = b.length;
  const base = median(a);
  const diffs: number[] = [];
  for (const x of a) {
    for (const y of b) {
      diffs.push(y - x);
    }
  }
  diffs.sort((x, y) => x - y);
  const est = median(diffs);
  // k = largest c with P(U <= c) <= alpha/2; CI = [d(c+1), d(mn-c)] (1-based).
  let lo = diffs[0];
  let hi = diffs[diffs.length - 1];
  let exact = true;
  if (m * n <= 2500) {
    const cdf = uCdf(m, n);
    let c = -1;
    while (c + 1 < cdf.length && cdf[c + 1] <= alpha / 2) {
      c++;
    }
    if (c >= 0) {
      lo = diffs[c];
      hi = diffs[m * n - 1 - c];
    } else {
      // Too few blocks for any interval at this level.
      exact = false;
    }
  } else {
    const z = 1.959964;
    const c = Math.max(0, Math.floor((m * n) / 2 - z * Math.sqrt((m * n * (m + n + 1)) / 12)));
    lo = diffs[c];
    hi = diffs[m * n - 1 - c];
  }
  // Mann-Whitney U (count of b > a, ties half) and its exact two-sided p-value.
  let u = 0;
  for (const x of a) {
    for (const y of b) {
      u += y > x ? 1 : y === x ? 0.5 : 0;
    }
  }
  let p = 1;
  if (m * n <= 2500) {
    const cdf = uCdf(m, n);
    const uLow = Math.floor(Math.min(u, m * n - u));
    p = Math.min(1, 2 * cdf[uLow]);
  }
  const pct = (x: number) => (base === 0 ? 0 : (x / base) * 100);
  return {
    shift: est,
    pct: pct(est),
    ciLow: pct(lo),
    ciHigh: pct(hi),
    p,
    significant: exact && (lo > 0 || hi < 0),
  };
}

/**
 * Benjamini-Hochberg: given p-like scores (here: bootstrap two-sided tail
 * probabilities), returns which hypotheses survive at false discovery rate q.
 */
export function benjaminiHochberg(pvalues: number[], q = 0.05): boolean[] {
  const order = pvalues.map((p, i) => [p, i] as const).sort((x, y) => x[0] - y[0]);
  let cutoff = -1;
  order.forEach(([p], rank) => {
    if (p <= ((rank + 1) / pvalues.length) * q) {
      cutoff = rank;
    }
  });
  const keep = new Array(pvalues.length).fill(false);
  for (let r = 0; r <= cutoff; r++) {
    keep[order[r][1]] = true;
  }
  return keep;
}

/** Fisher-Yates with a seed, for randomized run orders. */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rnd = mulberry32(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
