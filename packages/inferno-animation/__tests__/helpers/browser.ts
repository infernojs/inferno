import { hasPendingAnimations } from 'inferno-animation';

export interface Position {
  x: number;
  y: number;
}

export const frame = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
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
