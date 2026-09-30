import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { analyzeFrames, analyzeLatency, type FrameStats, type LatencyMetrics } from '../analysis/latency.ts';
import { analyzeTrace, STAGES, type TraceMetrics } from '../analysis/trace.ts';
import { buildApp, type BuiltApp } from '../apps/build.ts';
import { APPS } from '../apps/registry.ts';
import { fileSha256, type HeadlessMode, resolveBrowser } from '../lib/browsers.ts';
import { snapshotEnv } from '../lib/env.ts';
import { buildOptionMatrix } from '../lib/options.ts';
import { BENCH_DIR, cachePath } from '../lib/paths.ts';
import { median, quantile, seededShuffle, shift, summarize } from '../lib/stats.ts';
import { run, table } from '../lib/util.ts';
import { launchBrowser } from '../runner/launch.ts';
import { meanSites, type SiteSample, startSampling, stopSampling } from '../runner/allocsites.ts';
import { CALL_GROUPS, CALLS_INSTRUMENT, type CallCounts, type CallsSample, diffCounts, groupCounts, subtractCalls } from '../runner/domcalls.ts';
import { measureMemory, type MemoryMetrics } from '../runner/memory.ts';
import { classify, type CounterSample, gpuThreads, identifyRenderer, Pmu, rendererPids, rendererThreads, subtract } from '../runner/pmu.ts';
import { PageSession, type OpReport } from '../runner/session.ts';
import { LATENCY_CATEGORIES, startTracing, stopTracing } from '../runner/tracing.ts';
import { selectWorkloads, type Workload } from '../runner/workloads.ts';
import { startServer } from '../server/server.ts';
import { ensureVariant } from '../variants/build.ts';
import { parseVariantList } from '../variants/spec.ts';

type Mode = 'timing' | 'trace' | 'memory' | 'counters' | 'latency' | 'frames' | 'alloc' | 'domcalls' | 'allocsites';

const CALLS_BASELINE = join(BENCH_DIR, 'baselines', 'animcalls.json');

/** Median of every call name over the records, zeros dropped. */
function medianCounts(samples: CallCounts[]): CallCounts {
  const out: CallCounts = {};
  for (const k of new Set(samples.flatMap((c) => Object.keys(c)))) {
    const m = median(samples.map((c) => c[k] ?? 0));
    if (m !== 0) {
      out[k] = m;
    }
  }
  return out;
}

/**
 * alloc mode, op minus a null op: V8 bytes allocated, GCs and main-thread instructions from the
 * InfernoProf infernoBenchCounters(), for the op (input to the end of the next frame) and for the
 * whole window after the input (--window ms, animation frames included). Blink (Oilpan) objects
 * are not counted, only their JS wrappers.
 */
interface AllocSample {
  opBytes: number;
  opGcs: number;
  opInstructions: number;
  windowBytes: number;
  windowGcs: number;
  windowInstructions: number;
}

function allocDelta(r: OpReport): AllocSample {
  if (!r.c0 || !r.c1) {
    throw new Error('alloc mode needs infernoBenchCounters(): use --browser infernoprof');
  }
  const d = (a: number[] | null | undefined, i: number) => (a && r.c0![i] >= 0 && a[i] >= 0 ? a[i] - r.c0![i] : NaN);
  return {
    opBytes: d(r.c1, 0),
    opGcs: d(r.c1, 1),
    opInstructions: d(r.c1, 2),
    windowBytes: d(r.c2, 0),
    windowGcs: d(r.c2, 1),
    windowInstructions: d(r.c2, 2),
  };
}

function subtractAlloc(a: AllocSample, b: AllocSample): AllocSample {
  return Object.fromEntries(Object.keys(a).map((k) => [k, a[k as keyof AllocSample] - b[k as keyof AllocSample]])) as unknown as AllocSample;
}

interface IterationRecord {
  block: number;
  variant: string;
  workload: string;
  /** ms: input dispatch -> after next frame's main-thread work (untraced). */
  total: number;
  /** ms: input received -> dispatch start. */
  inputDelay: number;
  /** ms: dispatch start -> the next frame's rAF callback. */
  toRaf?: number;
  trace?: TraceMetrics;
  memory?: MemoryMetrics;
  counters?: CounterSample;
  latency?: LatencyMetrics;
  frames?: FrameStats;
  alloc?: AllocSample;
  calls?: CallsSample;
  sites?: SiteSample;
  checksum: string | null;
  error: string | null;
}

/** Physical cores of CCD0 and their SMT siblings on this 5950X layout. */
const CCD0 = '0-7,16-23';
const CCD1 = '8-15,24-31';

/** The most recent report, for wrappers such as `bench aa`. */
export let lastReport: any[] = [];

export default async function runCmd(argv: string[]): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: {
      mode: { type: 'string', default: 'timing' },
      variants: { type: 'string' },
      workloads: { type: 'string', default: 'jfb:*' },
      browser: { type: 'string' },
      headless: { type: 'string', default: 'new' },
      blocks: { type: 'string', default: '5' },
      iters: { type: 'string', default: '3' },
      warmup: { type: 'string', default: 'jfb' },
      sandbox: { type: 'string', default: 'on' },
      throttle: { type: 'string', default: 'none' },
      pin: { type: 'string', default: 'none' },
      transform: { type: 'string' },
      seed: { type: 'string', default: '1' },
      json: { type: 'boolean', default: false },
      'save-traces': { type: 'boolean', default: false },
      frames: { type: 'string', default: 'vsync' },
      metric: { type: 'string' },
      snapshot: { type: 'boolean', default: false },
      minify: { type: 'string' },
      duration: { type: 'string', default: '3000' },
      'js-flags': { type: 'string' },
      window: { type: 'string', default: '1500' },
      parallel: { type: 'string', default: '1' },
      settle: { type: 'string', default: '1000' },
      baseline: { type: 'string' },
    },
  });
  const mode = values.mode as Mode;
  if (!['timing', 'trace', 'memory', 'counters', 'latency', 'frames', 'alloc', 'domcalls', 'allocsites'].includes(mode)) {
    throw new Error(`--mode must be timing, trace, memory, counters, latency, frames, alloc, domcalls or allocsites (got ${mode})`);
  }
  const specs = parseVariantList(values.variants);
  const workloads = selectWorkloads(values.workloads!);
  const headless = values.headless as HeadlessMode;
  const resolved = resolveBrowser(values.browser ?? (mode === 'alloc' ? 'infernoprof' : 'cft-152'), headless);
  const [options] = buildOptionMatrix(values.transform, values.minify ?? 'on');
  const blocks = Number(values.blocks);
  const iters = Number(values.iters);
  // jfb: the workloads' own warmups; none; or a number of warmup ops (harness apps)
  const warmup = values.warmup === 'none' ? false : /^\d+$/.test(values.warmup!) ? Number(values.warmup) : true;
  // Counters need dumpable renderers: perf_event_open on another process's threads. alloc mode
  // reads the renderer's own counters, which the sandbox blocks too.
  const sandbox = mode === 'counters' || mode === 'alloc' ? false : values.sandbox !== 'off';
  const windowMs = Number(values.window);
  // Pages at once. Only for modes whose numbers are per renderer thread or exact counts: tracing,
  // PMU groups, frames and heap measurements need the machine to themselves.
  const parallel = Number(values.parallel);
  if (parallel > 1 && !['alloc', 'domcalls', 'allocsites', 'timing'].includes(mode)) {
    throw new Error('--parallel is for --mode alloc, domcalls, allocsites or timing');
  }
  const jsFlags = [...(values['js-flags'] ? values['js-flags'].split(/\s+/).filter(Boolean) : []), ...(mode === 'alloc' ? ['--expose-statistics'] : [])];
  const pmu = mode === 'counters' ? await Pmu.start() : null;

  if (values.pin === 'ccd0') {
    // User-level affinity only: the browser on CCD0, this harness on CCD1.
    await run('taskset', ['-a', '-p', '-c', CCD1, String(process.pid)]);
  }

  // Build every (variant, app) pair up front and serve them.
  const server = await startServer();
  const urls = new Map<string, string>();
  const appDirs = new Map<string, string>();
  const builtApps: BuiltApp[] = [];
  for (const spec of specs) {
    const variant = await ensureVariant(spec);
    for (const appName of new Set(workloads.map((w) => w.app))) {
      const built = await buildApp(APPS[appName], variant, options);
      builtApps.push(built);
      urls.set(`${spec.id}\0${appName}`, server.origin + server.mount(built.dir));
      appDirs.set(`${spec.id}\0${appName}`, built.dir);
    }
  }
  const browserSha = await fileSha256(resolved.executable);

  const records: IterationRecord[] = [];
  const envs = [];
  const started = Date.now();
  const runId = new Date(started).toISOString().replace(/[:.]/g, '-');
  const traceDir = cachePath('results', 'run', `${runId}-traces`);
  if (values['save-traces']) {
    mkdirSync(traceDir, { recursive: true });
  }
  type Job = { variant: string; w: Workload; i: number };
  const jobs: Job[] = specs.flatMap((s) => workloads.flatMap((w) => Array.from({ length: iters }, (_, i) => ({ variant: s.id, w, i }))));
  try {
    for (let b = 0; b < blocks; b++) {
      envs.push(snapshotEnv());
      const launched = await launchBrowser(resolved, {
        headless,
        sandbox,
        jsFlags: jsFlags.length ? jsFlags : undefined,
        // InfernoProf's in-page counters also need the PMU env (and the sandbox off for instructions)
        env: mode === 'alloc' || resolved.name === 'infernoprof' ? { INFERNO_BENCH_PMU: '1' } : undefined,
        wrapper: values.pin === 'ccd0' ? ['taskset', '-c', CCD0] : undefined,
        // Unthrottled: frames start as soon as the main thread asks for one, so
        // totals stop depending on the input's phase relative to vsync.
        extraArgs: values.frames === 'unthrottled' ? ['--disable-frame-rate-limit', '--disable-gpu-vsync'] : [],
      });
      const browserCdp = await launched.browser.target().createCDPSession();
      try {
        const order = seededShuffle(jobs, Number(values.seed) * 7919 + b);
        const runJob = async (n: number, job: Job): Promise<void> => {
          if (!values.json) {
            process.stderr.write(`\rblock ${b + 1}/${blocks} ${n + 1}/${order.length} ${job.variant} ${job.w.id}`.padEnd(110).slice(0, 110));
          }
          const url = urls.get(`${job.variant}\0${job.w.app}`)! + (job.w.query ? `?${job.w.query}` : '');
          const renderersBefore = pmu ? await rendererPids(browserCdp) : null;
          const s = await PageSession.open(launched.browser, url, mode === 'domcalls' ? [CALLS_INSTRUMENT] : []);
          let rec: IterationRecord;
          try {
            // alloc and domcalls measure their null op before the workload's init, so the measured
            // op follows the preparation directly: a null op with a 1.5 s window in between would
            // let animations that the preparation started end first.
            let nullReport: OpReport | null = null;
            if (mode === 'alloc' || mode === 'domcalls') {
              nullReport = await s.measuredClick(await s.addNullTarget(), {
                before: async () => {
                  await s.evaluate('window.gc()');
                  await s.frames(2);
                },
                windowMs,
                settleMs: mode === 'domcalls' ? Number(values.settle) : 0,
              });
            }
            const op = await job.w.init(s, warmup);
            let counters: CounterSample | undefined;
            if (pmu && renderersBefore) {
              const fresh = [...(await rendererPids(browserCdp))].filter((p) => !renderersBefore.has(p));
              const pid = await identifyRenderer(fresh, () =>
                s.evaluate('(() => { const end = performance.now() + 30; while (performance.now() < end); })()'),
              );
              const threads = rendererThreads(pid);
              threads.gpu.push(...(await gpuThreads(browserCdp)));
              await pmu.open([threads.main, ...threads.compositor, ...threads.gpu]);
              const nullTarget = await s.addNullTarget();
              const bracket = async (fn: (hooks: { before: () => Promise<void>; justBefore: () => Promise<void> }) => Promise<unknown>) => {
                await fn({
                  before: async () => {
                    await s.evaluate('window.gc()');
                    await s.frames(2);
                  },
                  justBefore: async () => {
                    await pmu.send('reset');
                    await pmu.send('enable');
                  },
                });
                await pmu.send('disable');
                return classify(await pmu.read(), threads);
              };
              const nullSample = await bracket((h) => s.measuredClick(nullTarget, h));
              const opSample = await bracket((h) =>
                op.kind === 'key' ? s.measuredKey(op.selector, op.key!, h) : s.measuredClick(op.selector, h),
              );
              await pmu.send('close');
              counters = subtract(opSample, nullSample);
            }
            if (op.kind === 'loop') {
              if (mode !== 'frames') {
                throw new Error(`${job.w.id} is a loop workload: use --mode frames`);
              }
              await startTracing(browserCdp, LATENCY_CATEGORIES);
              await new Promise((r) => setTimeout(r, 100));
              await s.evaluate('window.__bench.startLoop()');
              await new Promise((r) => setTimeout(r, Number(values.duration)));
              await s.evaluate('window.__bench.stopLoop()');
              const frames = analyzeFrames(await stopTracing(browserCdp));
              records.push({
                block: b,
                variant: job.variant,
                workload: job.w.id,
                total: NaN,
                inputDelay: NaN,
                frames,
                checksum: null,
                error: null,
              });
              return;
            }
            const before = async () => {
              if (mode === 'latency') {
                await startTracing(browserCdp, LATENCY_CATEGORIES);
                await new Promise((r) => setTimeout(r, 100));
              }
              if (mode === 'trace') {
                await startTracing(browserCdp);
                await new Promise((r) => setTimeout(r, 100));
              }
              await s.evaluate('window.gc()');
              await s.frames(2);
              if (values.throttle === 'jfb' && job.w.jfbThrottle) {
                await s.cdp.send('Emulation.setCPUThrottlingRate', { rate: job.w.jfbThrottle });
              }
            };
            let alloc: AllocSample | undefined;
            let calls: CallsSample | undefined;
            let sites: SiteSample | undefined;
            let allocReport: OpReport | null = null;
            if (mode === 'allocsites') {
              const hooks = {
                before: async () => {
                  await before();
                  await startSampling(s.cdp);
                },
                windowMs,
              };
              allocReport = op.kind === 'key' ? await s.measuredKey(op.selector, op.key!, hooks) : await s.measuredClick(op.selector, hooks);
              sites = await stopSampling(s.cdp, appDirs.get(`${job.variant}\0${job.w.app}`)!);
            }
            if (mode === 'domcalls') {
              const hooks = { before, windowMs, settleMs: Number(values.settle) };
              const sample = (r: OpReport): CallsSample => {
                if (!r.c0 || !r.c3) {
                  throw new Error('call counts missing: the page did not install __benchProbe');
                }
                return { op: diffCounts(r.c1, r.c0), window: diffCounts(r.c2, r.c0), settled: diffCounts(r.c3, r.c2) };
              };
              const nullSample = sample(nullReport!);
              allocReport = op.kind === 'key' ? await s.measuredKey(op.selector, op.key!, hooks) : await s.measuredClick(op.selector, hooks);
              calls = subtractCalls(sample(allocReport), nullSample);
            }
            if (mode === 'alloc') {
              const hooks = { before, windowMs };
              const nullSample = allocDelta(nullReport!);
              allocReport = op.kind === 'key' ? await s.measuredKey(op.selector, op.key!, hooks) : await s.measuredClick(op.selector, hooks);
              alloc = subtractAlloc(allocDelta(allocReport), nullSample);
            }
            // Counters and alloc modes already ran the op inside their brackets.
            const report: OpReport | null = counters
              ? null
              : allocReport
                ? allocReport
                : op.kind === 'key'
                  ? await s.measuredKey(op.selector, op.key!, { before })
                  : await s.measuredClick(op.selector, { before });
            await s.cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
            let trace: TraceMetrics | undefined;
            let latency: LatencyMetrics | undefined;
            if (mode === 'latency') {
              // Presentation happens after the main-thread frame: give the compositor time.
              await new Promise((r) => setTimeout(r, 250));
              const events = await stopTracing(browserCdp);
              latency = analyzeLatency(events, op.kind === 'key' ? 'KEY_PRESSED' : 'MOUSE_RELEASED');
              trace = analyzeTrace(events, op.kind === 'key' ? 'keydown' : 'click');
            }
            if (mode === 'trace') {
              await new Promise((r) => setTimeout(r, 100));
              const events = await stopTracing(browserCdp);
              if (values['save-traces']) {
                const name = `${job.variant}_${job.w.id.replace(/[^\w.-]+/g, '_')}_b${b}_i${job.i}.json.gz`;
                writeFileSync(join(traceDir, name), gzipSync(JSON.stringify({ traceEvents: events })));
              }
              trace = analyzeTrace(events, op.kind === 'key' ? 'keydown' : 'click');
            }
            const error = await job.w.check(s);
            const memory = mode === 'memory' ? await measureMemory(s, values.snapshot!) : undefined;
            rec = {
              block: b,
              variant: job.variant,
              workload: job.w.id,
              total: report ? report.t1 - report.t0 : NaN,
              inputDelay: report ? report.t0 - report.inputTs : NaN,
              toRaf: report ? report.raf - report.t0 : NaN,
              // Other modes on InfernoProf with --js-flags=--expose-statistics: the op's own counters
              // (no null op subtracted)
              alloc: alloc ?? (report && Array.isArray(report.c0) && Array.isArray(report.c1) ? allocDelta(report) : undefined),
              trace,
              latency,
              memory,
              counters,
              calls,
              sites,
              checksum: await s.checksum(job.w.root),
              error,
            };
          } catch (err) {
            rec = {
              block: b,
              variant: job.variant,
              workload: job.w.id,
              total: NaN,
              inputDelay: NaN,
              checksum: null,
              error: String(err instanceof Error ? err.message : err),
            };
          } finally {
            await s.close();
          }
          records.push(rec);
        };
        // --parallel: that many pages (each its own renderer) at once
        let next = 0;
        await Promise.all(
          Array.from({ length: parallel }, async () => {
            while (next < order.length) {
              const n = next++;
              await runJob(n, order[n]);
            }
          }),
        );
      } finally {
        await launched.close();
      }
    }
  } finally {
    await pmu?.stop();
    await server.close();
    if (!values.json) {
      process.stderr.write(`\r${''.padEnd(110)}\r`);
    }
  }

  // ---- aggregate: per-block medians, shift vs the first variant ----
  const baseId = specs[0].id;
  const metricName =
    values.metric ??
    (mode === 'trace'
      ? 'busy'
      : mode === 'memory'
        ? 'jsHeap'
        : mode === 'counters'
          ? 'instructions'
          : mode === 'latency'
            ? 'latency'
            : mode === 'frames'
              ? 'p95Frame'
              : mode === 'alloc'
                ? 'allocOp'
                : mode === 'domcalls'
                  ? 'callsWindow'
                  : mode === 'allocsites'
                    ? 'sampledWindow'
                    : 'total');
  const metric = (r: IterationRecord): number => {
    switch (metricName) {
      case 'busy':
        return r.trace?.busy ?? NaN;
      case 'jfb':
        return r.trace?.jfbTotal ?? NaN;
      case 'jsHeap':
      case 'embedderHeap':
      case 'backingStorage':
        return r.memory ? r.memory[metricName] / 1024 : NaN;
      case 'uaMemory':
        return r.memory?.uaMemory != null ? r.memory.uaMemory / 1024 : NaN;
      case 'latency':
        return r.latency?.total ?? NaN;
      case 'p95Frame':
        return r.frames ? quantile(r.frames.durations, 0.95) : NaN;
      case 'droppedPct':
        return r.frames ? (r.frames.dropped / Math.max(1, r.frames.presented + r.frames.dropped)) * 100 : NaN;
      case 'sampledWindow':
        return r.sites ? r.sites.total / 1024 : NaN;
      case 'callsOp':
        return r.calls ? Object.values(r.calls.op).reduce((a, b) => a + b, 0) : NaN;
      case 'callsWindow':
        return r.calls ? Object.values(r.calls.window).reduce((a, b) => a + b, 0) : NaN;
      case 'allocOp':
        return r.alloc ? r.alloc.opBytes / 1024 : NaN;
      case 'allocWindow':
        return r.alloc ? r.alloc.windowBytes / 1024 : NaN;
      case 'gcWindow':
        return r.alloc ? r.alloc.windowGcs : NaN;
      case 'instrOp':
        return r.alloc ? r.alloc.opInstructions / 1e6 : NaN;
      case 'instrWindow':
        return r.alloc ? r.alloc.windowInstructions / 1e6 : NaN;
      case 'instructions':
      case 'cycles':
      case 'branch-misses':
      case 'L1-dcache-load-misses':
      case 'stalled-cycles-frontend':
        return r.counters ? r.counters.main[metricName] : NaN;
      default:
        return r.total;
    }
  };
  const report: any[] = [];
  const rows: (string | number)[][] = [];
  for (const w of workloads) {
    const baseChecksum = records.find((r) => r.variant === baseId && r.workload === w.id && r.checksum)?.checksum;
    const blocksOf = (variant: string) =>
      Array.from({ length: blocks }, (_, b) =>
        median(records.filter((r) => r.variant === variant && r.workload === w.id && r.block === b && !r.error).map(metric)),
      ).filter((x) => Number.isFinite(x));
    const baseBlocks = blocksOf(baseId);
    for (const spec of specs) {
      const recs = records.filter((r) => r.variant === spec.id && r.workload === w.id);
      const ok = recs.filter((r) => !r.error);
      const blockMedians = blocksOf(spec.id);
      const summary = summarize(ok.map(metric));
      const est = spec.id !== baseId && blockMedians.length >= 3 && baseBlocks.length >= 3 ? shift(baseBlocks, blockMedians) : null;
      // Loop workloads (frames mode) produce no checksum.
      const checksumOk = baseChecksum == null ? ok.every((r) => r.checksum == null) : ok.every((r) => r.checksum === baseChecksum);
      const errors = recs.length - ok.length;
      const stages =
        mode === 'trace' ? Object.fromEntries(STAGES.map((st) => [st, median(ok.map((r) => r.trace!.stages[st]))])) : undefined;
      const memory =
        mode === 'memory'
          ? {
              jsHeapKiB: median(ok.map((r) => r.memory!.jsHeap / 1024)),
              embedderKiB: median(ok.map((r) => r.memory!.embedderHeap / 1024)),
              uaMemoryKiB: median(ok.map((r) => (r.memory!.uaMemory ?? NaN) / 1024)),
              nodes: median(ok.map((r) => r.memory!.counters.live_nodes ?? NaN)),
              layoutObjects: median(ok.map((r) => r.memory!.counters.live_layout_objects ?? NaN)),
              listeners: median(ok.map((r) => r.memory!.counters.jsEventListeners ?? NaN)),
            }
          : undefined;
      const counters =
        mode === 'counters'
          ? {
              instructions: median(ok.map((r) => r.counters!.main.instructions)),
              cycles: median(ok.map((r) => r.counters!.main.cycles)),
              branchMisses: median(ok.map((r) => r.counters!.main['branch-misses'])),
              l1dMisses: median(ok.map((r) => r.counters!.main['L1-dcache-load-misses'])),
              compositorInstructions: median(ok.map((r) => r.counters!.compositor.instructions)),
              gpuInstructions: median(ok.map((r) => r.counters!.gpu.instructions)),
              multiplexed: ok.some((r) => r.counters!.multiplexed),
            }
          : undefined;
      const alloc =
        mode === 'alloc'
          ? {
              opKiB: median(ok.map((r) => r.alloc!.opBytes / 1024)),
              windowKiB: median(ok.map((r) => r.alloc!.windowBytes / 1024)),
              opGcs: median(ok.map((r) => r.alloc!.opGcs)),
              windowGcs: median(ok.map((r) => r.alloc!.windowGcs)),
              opMinstr: median(ok.map((r) => r.alloc!.opInstructions / 1e6)),
              windowMinstr: median(ok.map((r) => r.alloc!.windowInstructions / 1e6)),
            }
          : undefined;
      const calls =
        mode === 'domcalls'
          ? {
              op: medianCounts(ok.map((r) => r.calls!.op)),
              window: medianCounts(ok.map((r) => r.calls!.window)),
              settled: medianCounts(ok.map((r) => r.calls!.settled)),
            }
          : undefined;
      const siteSummary =
        mode === 'allocsites'
          ? {
              byPackageKiB: Object.fromEntries(
                (['inferno', 'animation', 'app', 'harness', 'other', 'native'] as const).map((k) => [k, median(ok.map((r) => r.sites!.byPackage[k] / 1024))]),
              ),
              top: meanSites(ok.map((r) => r.sites!)).slice(0, 25),
            }
          : undefined;
      const latencyStages =
        mode === 'latency'
          ? Object.fromEntries(
              [...new Set(ok.flatMap((r) => Object.keys(r.latency?.stages ?? {})))].map((st) => [
                st,
                median(ok.map((r) => r.latency?.stages[st] ?? 0)),
              ]),
            )
          : undefined;
      const frames =
        mode === 'frames'
          ? {
              presented: median(ok.map((r) => r.frames!.presented)),
              dropped: median(ok.map((r) => r.frames!.dropped)),
              p50: median(ok.flatMap((r) => r.frames!.durations)),
              p99: quantile(ok.flatMap((r) => r.frames!.durations), 0.99),
              mainBusyPerFrame: median(ok.map((r) => r.frames!.mainBusyPerFrame)),
            }
          : undefined;
      report.push({
        workload: w.id,
        variant: spec.id,
        summary,
        blockMedians,
        est,
        checksumOk,
        errors,
        stages,
        memory,
        counters,
        alloc,
        calls,
        sites: siteSummary,
        latencyStages,
        frames,
      });
      rows.push([
        spec.id === baseId ? w.id : '',
        spec.id,
        mode === 'counters' ? summary.median.toFixed(0) : summary.median.toFixed(3),
        blockMedians.length >= 3 ? `${(summarize(blockMedians).rcv * 100).toFixed(1)}%` : '-',
        est ? `${est.pct >= 0 ? '+' : ''}${est.pct.toFixed(1)}% [${est.ciLow.toFixed(1)},${est.ciHigh.toFixed(1)}]${est.significant ? ' *' : ''}` : '',
        ...(stages ? ['script', 'gc', 'style', 'layout', 'paint', 'commit', 'idle'].map((st) => stages[st].toFixed(2)) : []),
        ...(latencyStages
          ? [
              (latencyStages.RendererMainProcessing ?? 0).toFixed(2),
              (latencyStages.RendererCompositorQueueingDelay ?? 0).toFixed(2),
              (latencyStages.RendererMainFinishedToCommit ?? 0).toFixed(2),
              (latencyStages.SubmitCompositorFrameToPresentationCompositorFrame ?? 0).toFixed(2),
            ]
          : []),
        ...(frames
          ? [
              String(frames.presented),
              String(frames.dropped),
              frames.p50.toFixed(2),
              frames.p99.toFixed(2),
              frames.mainBusyPerFrame.toFixed(2),
            ]
          : []),
        ...(counters
          ? [
              (counters.cycles / 1e6).toFixed(3),
              (counters.instructions / counters.cycles).toFixed(2),
              (counters.branchMisses / 1e3).toFixed(1),
              (counters.l1dMisses / 1e3).toFixed(1),
              (counters.compositorInstructions / 1e6).toFixed(3),
              (counters.gpuInstructions / 1e6).toFixed(3),
            ]
          : []),
        ...(siteSummary
          ? (['inferno', 'animation', 'app', 'harness', 'native'] as const).map((k) => siteSummary.byPackageKiB[k].toFixed(1))
          : []),
        ...(calls
          ? [
              String(Object.values(calls.op).reduce((a, b) => a + b, 0)),
              ...groupCounts(calls.window).map(String),
              String(Object.values(calls.settled).reduce((a, b) => a + b, 0)),
            ]
          : []),
        ...(alloc
          ? [
              alloc.opKiB.toFixed(2),
              alloc.windowKiB.toFixed(2),
              `${alloc.opGcs}/${alloc.windowGcs}`,
              alloc.opMinstr.toFixed(3),
              alloc.windowMinstr.toFixed(3),
            ]
          : []),
        ...(memory
          ? [
              memory.embedderKiB.toFixed(0),
              memory.uaMemoryKiB.toFixed(0),
              String(memory.nodes),
              String(memory.layoutObjects),
              String(memory.listeners),
            ]
          : []),
        (checksumOk ? 'ok' : 'DIFF') + (errors ? ` ${errors} err` : ''),
      ]);
    }
  }

  const out = {
    createdAt: new Date().toISOString(),
    durationS: (Date.now() - started) / 1000,
    mode,
    browser: { ...resolved, sha256: browserSha, headless, sandbox },
    options: {
      blocks,
      iters,
      warmup,
      throttle: values.throttle,
      pin: values.pin,
      frames: values.frames,
      metric: metricName,
      window: mode === 'alloc' ? windowMs : undefined,
      transform: options.transform,
      seed: values.seed,
    },
    variants: builtApps.map((a) => ({ variant: a.variant.spec.id, app: a.app.name, dir: a.dir, variantHash: a.variant.manifest.hash })),
    envs,
    report,
    records,
  };
  lastReport = report;
  let baselineFailed = false;
  const outDir = cachePath('results', 'run');
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${runId}-${mode}.json`);
  writeFileSync(outFile, JSON.stringify(out, null, 2));

  if (values.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const unit = mode === 'memory' || mode === 'alloc' || mode === 'allocsites' ? 'KiB' : mode === 'counters' ? '(main thread)' : mode === 'domcalls' ? 'calls' : 'ms';
    const head = ['workload', 'variant', `${metricName} ${unit}`, 'rCV', `Δ vs ${baseId} [95% CI]`];
    if (mode === 'trace') {
      head.push('script', 'gc', 'style', 'layout', 'paint', 'commit', 'idle');
    }
    if (mode === 'memory') {
      head.push('embedder KiB', 'uaMemory KiB', 'DOM nodes', 'layout objs', 'listeners');
    }
    if (mode === 'allocsites') {
      head.push('inferno KiB', 'animation KiB', 'app KiB', 'harness KiB', 'native KiB');
    }
    if (mode === 'domcalls') {
      head.push('op calls', ...CALL_GROUPS.map(([name]) => `${name} (win)`), 'settled');
    }
    if (mode === 'alloc') {
      head.push('op KiB', `${windowMs} ms KiB`, 'GCs op/win', 'op Minstr', 'win Minstr');
    }
    if (mode === 'counters') {
      head.push('Mcycles', 'IPC', 'kbr-miss', 'kL1D-miss', 'comp Minstr', 'gpu Minstr');
    }
    if (mode === 'latency') {
      head.push('main proc', 'queueing', 'main→commit', 'submit→present');
    }
    if (mode === 'frames') {
      head.push('presented', 'dropped', 'p50 ms', 'p99 ms', 'main ms/frame');
    }
    head.push('check');
    console.log(table(head, rows));
    const errs = records.filter((r) => r.error);
    for (const e of errs.slice(0, 10)) {
      console.log(`error: ${e.variant} ${e.workload} block ${e.block}: ${e.error}`);
    }
    console.log(`\n${resolved.name} (${headless}), ${blocks} blocks × ${iters} iters in ${out.durationS.toFixed(0)} s; * = CI excludes 0`);
    if (mode === 'allocsites') {
      for (const r of report) {
        console.log(`\n${r.workload} ${r.variant}: sampled allocation sites, mean KiB per op (${windowMs} ms window)`);
        for (const [site, bytes] of r.sites.top.filter(([, b]: [string, number]) => b >= 1024).slice(0, 15)) {
          console.log(`  ${(bytes / 1024).toFixed(1).padStart(8)}  ${site}`);
        }
      }
    }
    if (mode === 'domcalls' && values.baseline) {
      baselineFailed = callsBaseline(values.baseline, report.filter((r) => r.variant === baseId));
    }
    console.log(`results: ${outFile}`);
  }
  return records.some((r) => r.error) || report.some((r) => !r.checksumOk) || baselineFailed ? 1 : 0;
}

/**
 * --baseline save: store the first variant's median op and window counts per workload.
 * --baseline check: fail when an op count grew at all or a window count grew by more than 2
 * (a frame more or less in 1.5 s is not a regression).
 */
function callsBaseline(action: string, rows: any[]): boolean {
  const stored: Record<string, { op: CallCounts; window: CallCounts }> = existsSync(CALLS_BASELINE)
    ? JSON.parse(readFileSync(CALLS_BASELINE, 'utf8'))
    : {};
  if (action === 'save') {
    for (const r of rows) {
      stored[r.workload] = { op: r.calls.op, window: r.calls.window };
    }
    writeFileSync(CALLS_BASELINE, JSON.stringify(stored, null, 2) + '\n');
    console.log(`baseline: saved ${rows.length} workloads to ${CALLS_BASELINE}`);
    return false;
  }
  let failed = false;
  for (const r of rows) {
    const base = stored[r.workload];
    if (!base) {
      console.log(`baseline: new workload ${r.workload} (run with --baseline save)`);
      continue;
    }
    for (const [win, slack] of [['op', 0], ['window', 2]] as const) {
      const grown = Object.entries(diffCounts(r.calls[win], base[win])).filter(([, d]) => d > slack);
      if (grown.length) {
        failed = true;
        console.log(`baseline: ${r.workload} ${win}: ${grown.map(([k, d]) => `${k} +${d}`).join(', ')}`);
      }
    }
  }
  console.log(failed ? 'baseline: FAILED' : `baseline: ok (${rows.length} workloads)`);
  return failed;
}
