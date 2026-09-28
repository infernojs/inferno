import { forceReflow } from './utils';

export const enum AnimationPhase {
  // Leaving elements are measured before any animation of the pass writes
  MEASURE_LEAVES,
  INITIALIZE,
  MEASURE,
  SET_START_STATE,
  READ_MOVES,
  RESET_MOVES,
  MEASURE_MOVES,
  SET_MOVE_START_STATE,
  ACTIVATE_TRANSITIONS,
  ACTIVATE_ANIMATION,
  REGISTER_LISTENERS,
}

type GlobalAnimationKey = string;
export interface GlobalAnimationState {
  width: number;
  height: number;
  x: number;
  y: number;
  ticks: number;
}
const _globalAnimationSources: Record<
  GlobalAnimationKey,
  GlobalAnimationState
> = {};

export function _globalAnimationGC(): void {
  let entriesLeft = false;

  for (const key in _globalAnimationSources) {
    if (--_globalAnimationSources[key].ticks < 0) {
      delete _globalAnimationSources[key];
    } else entriesLeft = true;
  }

  if (entriesLeft) {
    requestAnimationFrame(_globalAnimationGC);
  }
}

export function addGlobalAnimationSource(
  key: GlobalAnimationKey,
  state: GlobalAnimationState,
): void {
  state.ticks = 5;
  _globalAnimationSources[key] = state;

  if (_globalAnimationGC === null) {
    requestAnimationFrame(_globalAnimationGC);
  }
}

export function consumeGlobalAnimationSource(
  key: GlobalAnimationKey,
): GlobalAnimationState {
  const tmp = _globalAnimationSources[key];
  if (tmp !== undefined) {
    delete _globalAnimationSources[key];
  }
  return tmp;
}

interface QueuedAnimation {
  callback: (phase: AnimationPhase) => void;
  parent: Node | null;
  cancelled: boolean;
}
let animationQueue: QueuedAnimation[] = [];
let activationQueue: QueuedAnimation[] = [];
let nextFrame = 0;
let activationFrame = 0;
let microtaskPending = false;
const pendingParents = new Set<Node>();

function activate(): void {
  activationFrame = 0;
  const queue = activationQueue;
  activationQueue = [];
  for (const phase of [
    AnimationPhase.ACTIVATE_ANIMATION,
    AnimationPhase.REGISTER_LISTENERS,
  ]) {
    for (const item of queue) if (!item.cancelled) item.callback(phase);
  }
}

function prepare(queue: QueuedAnimation[]): void {
  if (!queue.length) return;
  for (
    let phase = AnimationPhase.MEASURE_LEAVES;
    phase <= AnimationPhase.ACTIVATE_TRANSITIONS;
    phase++
  ) {
    if (
      phase === AnimationPhase.ACTIVATE_TRANSITIONS &&
      queue.some((item) => !item.cancelled)
    )
      forceReflow();
    for (const item of queue) if (!item.cancelled) item.callback(phase);
  }
  activationQueue.push(...queue.filter((item) => !item.cancelled));
  if (activationQueue.length && !activationFrame)
    activationFrame = requestAnimationFrame(activate);
}

function prepareFrame(): void {
  nextFrame = 0;
  const queue = animationQueue;
  animationQueue = [];
  prepare(queue);
}

/** Prepare only affected parents, after all synchronous/nested commits finish. */
export function scheduleMoveFlush(parent: Node): void {
  pendingParents.add(parent);
  if (microtaskPending) return;
  microtaskPending = true;
  queueMicrotask(() => {
    microtaskPending = false;
    const queue: QueuedAnimation[] = [];
    animationQueue = animationQueue.filter((item) => {
      if (item.parent && pendingParents.has(item.parent)) {
        queue.push(item);
        return false;
      }
      return true;
    });
    pendingParents.clear();
    if (!animationQueue.length && nextFrame) {
      cancelAnimationFrame(nextFrame);
      nextFrame = 0;
    }
    prepare(queue);
  });
}

export function queueAnimation(
  callback: (phase: AnimationPhase) => void,
  parent: Node | null,
): () => void {
  const item = { callback, parent, cancelled: false };
  animationQueue.push(item);
  if (!nextFrame) nextFrame = requestAnimationFrame(prepareFrame);
  return () => {
    item.cancelled = true;
    animationQueue = animationQueue.filter((entry) => entry !== item);
    activationQueue = activationQueue.filter((entry) => entry !== item);
    if (!animationQueue.length && nextFrame) {
      cancelAnimationFrame(nextFrame);
      nextFrame = 0;
    }
    if (!activationQueue.length && activationFrame) {
      cancelAnimationFrame(activationFrame);
      activationFrame = 0;
    }
  };
}

interface RemovalBatch {
  prepare: () => void;
  callbacks: Set<() => void>;
}
let removals = new Map<Node, RemovalBatch>();
let removalFrame = 0;

export function hasQueuedRemoval(parent: Node): boolean {
  return removals.has(parent);
}

function drainRemovals(): void {
  removalFrame = 0;
  const batch = removals;
  removals = new Map();
  let error: unknown;
  let failed = false;
  const run = (callback: () => void) => {
    try {
      callback();
    } catch (caught) {
      if (!failed) error = caught;
      failed = true;
    }
  };
  // Read every source layout before any parent is changed. A custom hook that
  // throws must not strand completed leaves or another parent's callbacks.
  for (const entry of batch.values()) run(entry.prepare);
  for (const entry of batch.values())
    for (const callback of entry.callbacks) run(callback);
  if (failed) throw error;
}

export function queueRemoval(
  parent: Node,
  prepareRemoval: () => void,
  callback: () => void,
): void {
  let batch = removals.get(parent);
  if (!batch)
    removals.set(
      parent,
      (batch = { prepare: prepareRemoval, callbacks: new Set() }),
    );
  batch.callbacks.add(callback);
  if (!removalFrame) removalFrame = requestAnimationFrame(drainRemovals);
}

export function cancelRemovals(parent: Node): void {
  const batch = removals.get(parent);
  if (!batch) return;
  removals.delete(parent);
  // The last tracked list is gone, so no survivor animation is necessary.
  for (const callback of batch.callbacks) callback();
  if (!removals.size && removalFrame) {
    cancelAnimationFrame(removalFrame);
    removalFrame = 0;
  }
}

export function hasPendingAnimations(): boolean {
  return Boolean(
    nextFrame || activationFrame || microtaskPending || removalFrame,
  );
}
