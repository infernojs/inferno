import { mkdirSync, writeFileSync } from 'node:fs';
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
import { cachePath } from '../lib/paths.ts';
import { median, quantile, seededShuffle, shift, summarize } from '../lib/stats.ts';
import { run, table } from '../lib/util.ts';
import { launchBrowser } from '../runner/launch.ts';
import { measureMemory, type MemoryMetrics } from '../runner/memory.ts';
import { classify, type CounterSample, gpuThreads, identifyRenderer, Pmu, rendererPids, rendererThreads, subtract } from '../runner/pmu.ts';
import { PageSession, type OpReport } from '../runner/session.ts';
import { LATENCY_CATEGORIES, startTracing, stopTracing } from '../runner/tracing.ts';
import { selectWorkloads, type Workload } from '../runner/workloads.ts';
import { startServer } from '../server/server.ts';
import { ensureVariant } from '../variants/build.ts';
import { parseVariantList } from '../variants/spec.ts';

type Mode = 'timing' | 'trace' | 'memory' | 'counters' | 'latency' | 'frames';

interface IterationRecord {
  block: number;
  variant: string;
  workload: string;
  /** ms: input dispatch -> after next frame's main-thread work (untraced). */
  total: number;
  /** ms: input received -> dispatch start. */
  inputDelay: number;
  trace?: TraceMetrics;
  memory?: MemoryMetrics;
  counters?: CounterSample;
  latency?: LatencyMetrics;
  frames?: FrameStats;
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
      browser: { type: 'string', default: 'cft-152' },
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
    },
  });
  const mode = values.mode as Mode;
  if (!['timing', 'trace', 'memory', 'counters', 'latency', 'frames'].includes(mode)) {
    throw new Error(`--mode must be timing, trace, memory, counters, latency or frames (got ${mode})`);
  }
  const specs = parseVariantList(values.variants);
  const workloads = selectWorkloads(values.workloads!);
  const headless = values.headless as HeadlessMode;
  const resolved = resolveBrowser(values.browser!, headless);
  const [options] = buildOptionMatrix(values.transform, values.minify ?? 'on');
  const blocks = Number(values.blocks);
  const iters = Number(values.iters);
  const warmup = values.warmup !== 'none';
  // Counters need dumpable renderers: perf_event_open on another process's threads.
  const sandbox = mode === 'counters' ? false : values.sandbox !== 'off';
  const pmu = mode === 'counters' ? await Pmu.start() : null;

  if (values.pin === 'ccd0') {
    // User-level affinity only: the browser on CCD0, this harness on CCD1.
    await run('taskset', ['-a', '-p', '-c', CCD1, String(process.pid)]);
  }

  // Build every (variant, app) pair up front and serve them.
  const server = await startServer();
  const urls = new Map<string, string>();
  const builtApps: BuiltApp[] = [];
  for (const spec of specs) {
    const variant = await ensureVariant(spec);
    for (const appName of new Set(workloads.map((w) => w.app))) {
      const built = await buildApp(APPS[appName], variant, options);
      builtApps.push(built);
      urls.set(`${spec.id}\0${appName}`, server.origin + server.mount(built.dir));
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
        wrapper: values.pin === 'ccd0' ? ['taskset', '-c', CCD0] : undefined,
        // Unthrottled: frames start as soon as the main thread asks for one, so
        // totals stop depending on the input's phase relative to vsync.
        extraArgs: values.frames === 'unthrottled' ? ['--disable-frame-rate-limit', '--disable-gpu-vsync'] : [],
      });
      const browserCdp = await launched.browser.target().createCDPSession();
      try {
        const order = seededShuffle(jobs, Number(values.seed) * 7919 + b);
        for (const [n, job] of order.entries()) {
          if (!values.json) {
            process.stderr.write(`\rblock ${b + 1}/${blocks} ${n + 1}/${order.length} ${job.variant} ${job.w.id}`.padEnd(110).slice(0, 110));
          }
          const url = urls.get(`${job.variant}\0${job.w.app}`)! + (job.w.query ? `?${job.w.query}` : '');
          const renderersBefore = pmu ? await rendererPids(browserCdp) : null;
          const s = await PageSession.open(launched.browser, url);
          let rec: IterationRecord;
          try {
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
              continue;
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
            // Counters mode already ran the op inside its counter bracket.
            const report: OpReport | null = counters
              ? null
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
              trace,
              latency,
              memory,
              counters,
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
        }
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
      transform: options.transform,
      seed: values.seed,
    },
    variants: builtApps.map((a) => ({ variant: a.variant.spec.id, app: a.app.name, dir: a.dir, variantHash: a.variant.manifest.hash })),
    envs,
    report,
    records,
  };
  lastReport = report;
  const outDir = cachePath('results', 'run');
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${runId}-${mode}.json`);
  writeFileSync(outFile, JSON.stringify(out, null, 2));

  if (values.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const unit = mode === 'memory' ? 'KiB' : mode === 'counters' ? '(main thread)' : 'ms';
    const head = ['workload', 'variant', `${metricName} ${unit}`, 'rCV', `Δ vs ${baseId} [95% CI]`];
    if (mode === 'trace') {
      head.push('script', 'gc', 'style', 'layout', 'paint', 'commit', 'idle');
    }
    if (mode === 'memory') {
      head.push('embedder KiB', 'uaMemory KiB', 'DOM nodes', 'layout objs', 'listeners');
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
    console.log(`results: ${outFile}`);
  }
  return records.some((r) => r.error) || report.some((r) => !r.checksumOk) ? 1 : 0;
}
