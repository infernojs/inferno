import { hasPendingAnimations } from 'inferno-animation';

export interface Position {
  x: number;
  y: number;
}

// A window that is not on screen (minimized, covered or on another workspace) gets few or no animation
// frames, so a spec fails after this long without one, instead of running into the Jasmine timeout.
const FRAME_TIMEOUT = 1000;

// Counts the specs that have ended. A spec that timed out keeps running; when its frames resume, it
// stops instead of running its expectations in a later spec.
let specsDone = 0;

(globalThis as any).jasmine?.getEnv?.().addReporter({
  specDone() {
    specsDone++;
  },
});

export const frame = async (): Promise<void> => {
  const spec = specsDone;

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cancelAnimationFrame(handle);
      reject(
        new Error(
          `No animation frame in ${FRAME_TIMEOUT} ms, document.visibilityState is ${document.visibilityState}. ` +
            'A browser window that is not on screen gets few or no frames: run the browser tests headless.',
        ),
      );
    }, FRAME_TIMEOUT);
    const handle = requestAnimationFrame(() => {
      clearTimeout(timer);
      resolve();
    });
  });
  if (spec !== specsDone) {
    throw new Error('The spec that waited for this animation frame has ended');
  }
};

export async function until(
  predicate: () => boolean,
  frames = 120,
): Promise<void> {
  for (let i = 0; i < frames; i++) {
    if (predicate()) return;
    await frame();
  }
  throw new Error('Animation condition did not settle');
}

export function position(node: Element): Position {
  const rect = node.getBoundingClientRect();
  return { x: rect.left, y: rect.top };
}

// No distance for every element in before
export function zeros(
  before: Record<string, Position>,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const id of Object.keys(before)) result[id] = 0;
  return result;
}

/**
 * Helpers for the elements with a data-id in the root that scope returns: the container of a test,
 * or a shadow root inside it. The root is looked up by every call, so tests can create it in
 * beforeEach.
 */
export function browserHelpers(scope: () => ParentNode) {
  function elements(): HTMLElement[] {
    return Array.from(scope().querySelectorAll('[data-id]'));
  }
  function card(id: string): HTMLElement {
    return scope().querySelector('[data-id="' + id + '"]')!;
  }
  function transitions(property: string): Animation[] {
    const result: Animation[] = [];
    for (const node of elements()) {
      for (const animation of node.getAnimations()) {
        if (
          'transitionProperty' in animation &&
          animation.transitionProperty === property
        )
          result.push(animation);
      }
    }
    return result;
  }
  // Finishes the animations of the elements until none is left
  async function settle(): Promise<void> {
    await until(() => {
      for (const node of elements()) {
        for (const animation of node.getAnimations()) animation.finish();
      }
      return (
        !hasPendingAnimations() && !scope().querySelector('[class*="-active"]')
      );
    });
  }
  // Pauses the moves at a fraction of their duration
  async function seekMoves(fraction: number): Promise<void> {
    await until(() => transitions('transform').length > 0);
    // Seeking a paused animation completes the pause at once. Awaiting ready, a frame for each
    // move, could outlast a move's fallback timeout on a slow machine, which cancels the move.
    for (const animation of transitions('transform')) {
      animation.pause();
      const timing = animation.effect!.getTiming();
      animation.currentTime =
        (timing.delay || 0) + Number(timing.duration) * fraction;
    }
  }
  function positions(): Record<string, Position> {
    const result: Record<string, Position> = {};
    for (const node of elements()) result[node.dataset.id!] = position(node);
    return result;
  }
  // The distance of every element in before from its position there, in whole pixels
  function offsets(before: Record<string, Position>): Record<string, number> {
    const result: Record<string, number> = {};
    for (const id of Object.keys(before)) {
      const now = position(card(id));
      result[id] = Math.round(
        Math.hypot(now.x - before[id].x, now.y - before[id].y),
      );
    }
    return result;
  }
  return { card, elements, offsets, positions, seekMoves, settle, transitions };
}
