/**
 * Chrome JSON trace analysis for one measured op.
 *
 *  - jfbTotal: js-framework-benchmark's "total" (webdriver-ts/src/timeline.ts
 *    computeResultsCPU): click EventDispatch start -> end of the first renderer
 *    Commit after the last click/rAF/timer/layout/function-call event.
 *  - stages: self time of renderer main-thread slices in that window, by
 *    pipeline stage, plus idle time between tasks. Stages sum to the window.
 *  - raster: off-main-thread raster work of the same renderer after the commit.
 */

export interface TraceEvent {
  name: string;
  cat: string;
  ph: string;
  ts: number;
  dur?: number;
  tdur?: number;
  pid: number;
  tid: number;
  args?: any;
}

export const STAGES = ['script', 'gc', 'style', 'layout', 'prepaint', 'paint', 'layerize', 'commit', 'hittest', 'other', 'harness', 'idle'] as const;
export type Stage = (typeof STAGES)[number];

export interface TraceMetrics {
  /** ms, js-framework-benchmark compatible. */
  jfbTotal: number;
  /** ms per stage (self time), summing to jfbTotal. */
  stages: Record<Stage, number>;
  /** ms of main-thread work attributable to the page: jfbTotal - idle - harness. */
  busy: number;
  /** Thread CPU time of main-thread tasks in the window (ms). */
  mainCpu: number;
  gcCount: number;
  /** Raster task time on tile workers of the same renderer (ms). */
  raster: number;
  /** Microseconds from the input event dispatch to the start of the first commit. */
  toCommitStart: number;
  eventType: string;
  warnings: string[];
}

const STAGE_OF: Record<string, Stage> = {
  FunctionCall: 'script',
  EvaluateScript: 'script',
  'v8.run': 'script',
  'v8.callFunction': 'script',
  'V8.Execute': 'script',
  RunMicrotasks: 'script',
  TimerFire: 'script',
  FireAnimationFrame: 'script',
  EventDispatch: 'script',
  FireIdleCallback: 'script',
  'v8.compile': 'script',
  'V8.CompileCode': 'script',
  MinorGC: 'gc',
  MajorGC: 'gc',
  'V8.GCScavenger': 'gc',
  'V8.GCFinalizeMC': 'gc',
  'V8.GCIncrementalMarking': 'gc',
  'V8.GC_MC_BACKGROUND_EVACUATE_COPY': 'gc',
  BlinkGC: 'gc',
  'BlinkGC.AtomicPhase': 'gc',
  'CppGC.AtomicPause': 'gc',
  UpdateLayoutTree: 'style',
  RecalculateStyles: 'style',
  ScheduleStyleRecalculation: 'style',
  Layout: 'layout',
  PrePaint: 'prepaint',
  Paint: 'paint',
  PaintImage: 'paint',
  Layerize: 'layerize',
  UpdateLayer: 'layerize',
  Commit: 'commit',
  HitTest: 'hittest',
};

/** The runner's injected callbacks are named __bench*; their work is not the app's. */
function isHarness(e: TraceEvent): boolean {
  return (e.name === 'FunctionCall' || e.name === 'EventDispatch') && String(e.args?.data?.functionName ?? '').startsWith('__bench');
}

function stageOf(e: TraceEvent): Stage {
  if (isHarness(e)) {
    return 'harness';
  }
  if (STAGE_OF[e.name]) {
    return STAGE_OF[e.name];
  }
  if (e.name.startsWith('V8.GC') || e.name.startsWith('BlinkGC') || e.name.startsWith('CppGC')) {
    return 'gc';
  }
  return 'other';
}

/** Turns B/E pairs into X events per thread and keeps complete events. */
function completeEvents(events: TraceEvent[]): TraceEvent[] {
  const out: TraceEvent[] = [];
  const stacks = new Map<string, TraceEvent[]>();
  for (const e of events) {
    if (e.ph === 'X') {
      out.push(e);
    } else if (e.ph === 'B') {
      const k = `${e.pid}:${e.tid}`;
      (stacks.get(k) ?? stacks.set(k, []).get(k)!).push(e);
    } else if (e.ph === 'E') {
      const b = stacks.get(`${e.pid}:${e.tid}`)?.pop();
      if (b) {
        out.push({ ...b, ph: 'X', dur: e.ts - b.ts, args: { ...b.args, ...e.args } });
      }
    }
  }
  return out;
}

function threadNames(events: TraceEvent[]): Map<string, string> {
  const names = new Map<string, string>();
  for (const e of events) {
    if (e.ph === 'M' && e.name === 'thread_name') {
      names.set(`${e.pid}:${e.tid}`, e.args?.name ?? '');
    }
  }
  return names;
}

export function analyzeTrace(raw: TraceEvent[], eventType: 'click' | 'keydown'): TraceMetrics {
  const warnings: string[] = [];
  const events = completeEvents(raw.filter((e) => e.ph === 'X' || e.ph === 'B' || e.ph === 'E'));
  const dispatches = events.filter((e) => e.name === 'EventDispatch' && e.args?.data?.type === eventType);
  if (dispatches.length !== 1) {
    throw new Error(`Expected exactly one ${eventType} EventDispatch in the trace, found ${dispatches.length}`);
  }
  const input = dispatches[0];
  const pid = input.pid;
  const tid = input.tid;
  const inputEnd = input.ts + (input.dur ?? 0);

  // --- jfb-compatible total (pid filter only, events sorted by end) ---
  const endOf = (e: TraceEvent) => e.ts + (e.dur ?? 0);
  // rAF callbacks that only run the harness's __benchRaf are harness work too.
  const harnessCalls = events.filter((e) => e.pid === pid && e.tid === tid && isHarness(e));
  const isHarnessFrame = (e: TraceEvent) =>
    e.name === 'FireAnimationFrame' &&
    harnessCalls.some((h) => h.ts >= e.ts && endOf(h) <= endOf(e) && h.args?.data?.functionName === '__benchRaf');
  const onPid = events.filter((e) => e.pid === pid && !isHarness(e) && !isHarnessFrame(e)).sort((a, b) => endOf(a) - endOf(b));
  const during = onPid.filter((e) => e.ts > inputEnd || e === input);
  const startFrom = during.filter(
    (e) => e === input || e.name === 'FireAnimationFrame' || e.name === 'TimerFire' || e.name === 'Layout' || e.name === 'FunctionCall',
  );
  const startFromEvent = startFrom[startFrom.length - 1];
  const commits = during.filter((e) => e.name === 'Commit');
  let commit = commits.find((c) => c.ts > endOf(startFromEvent));
  if (!commit) {
    commit = commits[commits.length - 1];
    warnings.push('no commit after last work; used last commit');
  }
  if (!commit) {
    throw new Error('No Commit after the input in the trace');
  }
  const windowStart = input.ts;
  const windowEnd = endOf(commit);
  if (during.some((e) => e.name === 'FireAnimationFrame')) {
    warnings.push('app rAF inside the op window (jfb applies a rAF correction here; not applied)');
  }

  // --- self time per stage on the main thread, clipped to the window ---
  const main = events
    .filter((e) => e.pid === pid && e.tid === tid && endOf(e) > windowStart && e.ts < windowEnd)
    .sort((a, b) => a.ts - b.ts || (b.dur ?? 0) - (a.dur ?? 0));
  const stages = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<Stage, number>;
  const clip = (s: number, e: number) => Math.max(0, Math.min(e, windowEnd) - Math.max(s, windowStart));
  // Stack walk: each event's self time is its span minus its children's spans.
  const stack: { e: TraceEvent; end: number; childTime: number }[] = [];
  let covered = 0;
  let mainCpu = 0;
  let gcCount = 0;
  const finish = (frame: { e: TraceEvent; end: number; childTime: number }) => {
    const own = clip(frame.e.ts, frame.end) - frame.childTime;
    stages[stageOf(frame.e)] += Math.max(0, own);
  };
  for (const e of main) {
    const end = endOf(e);
    while (stack.length && stack[stack.length - 1].end <= e.ts) {
      finish(stack.pop()!);
    }
    const span = clip(e.ts, end);
    if (stack.length) {
      stack[stack.length - 1].childTime += span;
    } else {
      covered += span;
      if (e.tdur !== undefined && e.dur) {
        mainCpu += (e.tdur / e.dur) * span;
      }
    }
    if (stageOf(e) === 'gc' && (e.name === 'MinorGC' || e.name === 'MajorGC')) {
      gcCount++;
    }
    stack.push({ e, end, childTime: 0 });
  }
  while (stack.length) {
    finish(stack.pop()!);
  }
  stages.idle = Math.max(0, windowEnd - windowStart - covered);

  // --- raster on the renderer's tile workers, after the commit started ---
  const names = threadNames(raw);
  const raster = events
    .filter((e) => e.pid === pid && e.name === 'RasterTask' && e.ts >= commit!.ts && (names.get(`${e.pid}:${e.tid}`) ?? '').startsWith('CompositorTileWorker'))
    .reduce((a, e) => a + (e.dur ?? 0), 0);

  const ms = (us: number) => us / 1000;
  return {
    jfbTotal: ms(windowEnd - windowStart),
    busy: ms(windowEnd - windowStart - stages.idle - stages.harness),
    stages: Object.fromEntries(STAGES.map((s) => [s, ms(stages[s])])) as Record<Stage, number>,
    mainCpu: ms(mainCpu),
    gcCount,
    raster: ms(raster),
    toCommitStart: commit.ts - windowStart,
    eventType,
    warnings,
  };
}
