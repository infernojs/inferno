import type { TraceEvent } from './trace.ts';

/** Nested async slices keyed by (pid, async id, name), paired b/e. */
interface AsyncSlice {
  name: string;
  pid: number;
  id: string;
  ts: number;
  end: number;
  args: any;
}

function asyncSlices(events: TraceEvent[]): AsyncSlice[] {
  const open = new Map<string, TraceEvent>();
  const out: AsyncSlice[] = [];
  for (const e of events) {
    if (e.ph !== 'b' && e.ph !== 'e') {
      continue;
    }
    const raw = e as any;
    const id = String(raw.id2?.local ?? raw.id2?.global ?? raw.id ?? '');
    const k = `${e.pid}\0${id}\0${e.name}`;
    if (e.ph === 'b') {
      open.set(k, e);
    } else {
      const b = open.get(k);
      if (b) {
        open.delete(k);
        out.push({ name: e.name, pid: e.pid, id, ts: b.ts, end: e.ts, args: b.args });
      }
    }
  }
  return out;
}

export interface LatencyMetrics {
  eventType: string;
  /** ms from the OS input timestamp to presentation of the resulting frame. */
  total: number;
  /** ms per EventLatency stage (Chrome's input -> presentation breakdown). */
  stages: Record<string, number>;
}

/**
 * Chrome's EventLatency breakdown for the most recent input of `eventType`
 * (MOUSE_RELEASED for clicks, KEY_PRESSED for typing) in the trace.
 */
export function analyzeLatency(events: TraceEvent[], eventType: string): LatencyMetrics {
  const slices = asyncSlices(events);
  const candidates = slices.filter((s) => s.name === 'EventLatency' && s.args?.event_latency?.event_type === eventType);
  if (candidates.length === 0) {
    throw new Error(`No EventLatency of type ${eventType} in the trace`);
  }
  const lat = candidates.sort((a, b) => a.ts - b.ts)[candidates.length - 1];
  const stages: Record<string, number> = {};
  for (const s of slices) {
    if (s.pid === lat.pid && s.id === lat.id && s.name !== 'EventLatency' && s.ts >= lat.ts && s.end <= lat.end) {
      stages[s.name] = (stages[s.name] ?? 0) + (s.end - s.ts) / 1000;
    }
  }
  return { eventType, total: (lat.end - lat.ts) / 1000, stages };
}

export interface FrameStats {
  frames: number;
  presented: number;
  dropped: number;
  /** Frames the compositor produced without main-thread updates. */
  noUpdate: number;
  /** PipelineReporter durations (BeginImplFrame -> presentation), ms. */
  durations: number[];
  /** Main-thread busy time per presented frame, ms (task time / presented). */
  mainBusyPerFrame: number;
}

/**
 * Frame pipeline statistics from PipelineReporter slices of the renderer that
 * ran the loop (the process with the most FireAnimationFrame events).
 */
export function analyzeFrames(events: TraceEvent[]): FrameStats {
  const rafCount = new Map<number, number>();
  for (const e of events) {
    if (e.name === 'FireAnimationFrame') {
      rafCount.set(e.pid, (rafCount.get(e.pid) ?? 0) + 1);
    }
  }
  const pid = [...rafCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (pid === undefined) {
    throw new Error('No animation frames in the trace');
  }
  const reporters = asyncSlices(events).filter((s) => s.pid === pid && s.name === 'PipelineReporter');
  let presented = 0;
  let dropped = 0;
  let noUpdate = 0;
  const durations: number[] = [];
  for (const r of reporters) {
    const state = String(r.args?.frame_reporter?.state ?? r.args?.chrome_frame_reporter?.state ?? '');
    if (state.includes('PRESENTED')) {
      presented++;
      durations.push((r.end - r.ts) / 1000);
    } else if (state.includes('DROPPED')) {
      dropped++;
    } else if (state.includes('NO_UPDATE')) {
      noUpdate++;
    }
  }
  // Outermost task slices only (RunTask wraps ThreadControllerImpl::RunTask).
  const mainTid = events.find((e) => e.pid === pid && e.name === 'FireAnimationFrame')!.tid;
  const busy = events
    .filter((e) => e.pid === pid && e.tid === mainTid && e.ph === 'X' && e.name === 'RunTask')
    .reduce((a, e) => a + (e.dur ?? 0), 0);
  return {
    frames: reporters.length,
    presented,
    dropped,
    noUpdate,
    durations,
    mainBusyPerFrame: presented ? busy / 1000 / presented : NaN,
  };
}
