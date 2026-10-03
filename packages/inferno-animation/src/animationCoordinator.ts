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
  // Moves that do not happen drop out before any move writes its start state
  SELECT_MOVES,
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
  // The time that the source can be used until
  expires: number;
}
// How long an element that enters can start from the box of one that left with its key, in
// milliseconds: long enough for a page that loads before it mounts
const SOURCE_LIFETIME = 1000;
const sources: Record<GlobalAnimationKey, GlobalAnimationState> = {};
let sourceTimer: ReturnType<typeof setTimeout> | undefined;

// Sources that no element used do not stay in memory
function expireSources(): void {
  sourceTimer = undefined;
  const now = performance.now();
  for (const key in sources) {
    if (sources[key].expires > now) {
      sourceTimer ??= setTimeout(expireSources, SOURCE_LIFETIME);
    } else {
      delete sources[key];
    }
  }
}

export function addGlobalAnimationSource(
  key: GlobalAnimationKey,
  state: GlobalAnimationState,
): void {
  state.expires = performance.now() + SOURCE_LIFETIME;
  sources[key] = state;
  sourceTimer ??= setTimeout(expireSources, SOURCE_LIFETIME);
}

export function consumeGlobalAnimationSource(
  key: GlobalAnimationKey,
): GlobalAnimationState | null {
  const source = sources[key];
  if (source === undefined) return null;
  delete sources[key];
  return source.expires > performance.now() ? source : null;
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
  const phases = [
    AnimationPhase.ACTIVATE_ANIMATION,
    AnimationPhase.REGISTER_LISTENERS,
  ];
  for (let i = 0, len = phases.length; i < len; ++i) {
    const phase = phases[i];
    for (let j = 0, len2 = queue.length; j < len2; ++j) {
      const item = queue[j];
      if (!item.cancelled) item.callback(phase);
    }
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
    for (let i = 0, len = queue.length; i < len; ++i) {
      const item = queue[i];
      if (!item.cancelled) item.callback(phase);
    }
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
