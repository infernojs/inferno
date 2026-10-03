import { hasPendingAnimations } from 'inferno-animation';

// Animation frames that run when a test asks for them
export interface Frames {
  // The number of frames that are requested
  readonly size: number;
  // Runs the frames requested so far
  frame: () => void;
  // Runs frames until none is requested
  drain: () => void;
  // Gives the window its own animation frames back
  restore: () => void;
}

export function fakeFrames(): Frames {
  const callbacks = new Map<number, FrameRequestCallback>();
  const originalRAF = window.requestAnimationFrame;
  const originalCancelRAF = window.cancelAnimationFrame;
  let id = 0;
  window.requestAnimationFrame = (callback) => {
    callbacks.set(++id, callback);
    return id;
  };
  window.cancelAnimationFrame = (handle) => {
    callbacks.delete(handle);
  };
  function frame(): void {
    const requested = Array.from(callbacks.values());
    callbacks.clear();
    for (let i = 0, len = requested.length; i < len; ++i) {
      const callback = requested[i];
      callback(0);
    }
  }
  return {
    get size() {
      return callbacks.size;
    },
    frame,
    drain() {
      while (callbacks.size) frame();
    },
    restore() {
      window.requestAnimationFrame = originalRAF;
      window.cancelAnimationFrame = originalCancelRAF;
    },
  };
}

// Resolves when the animations of the tests before have finished. Their animations can only finish
// with animation frames, which a browser window that is not on screen doesn't get. Then the spec is
// skipped as pending after a while: it can't start clean, and the spec that left the animations has
// already failed.
export async function idle(): Promise<void> {
  const start = Date.now();

  while (hasPendingAnimations()) {
    if (Date.now() - start > 2000) {
      pending(
        'The animations of an earlier spec are still pending after 2 s: the browser window gets no animation frames',
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

// The viewport box [x, y, width, height] of an element
export type Rectangle = [number, number, number, number];

// Gives the elements that boxOf has a box for that box, until the end of the test
export function fakeBoxes(
  boxOf: (element: Element) => Rectangle | undefined,
): void {
  const original = Element.prototype.getBoundingClientRect;
  spyOn(Element.prototype, 'getBoundingClientRect').and.callFake(function (
    this: Element,
  ) {
    const box = boxOf(this);
    if (box === undefined) return original.call(this);
    const [x, y, width, height] = box;
    return {
      x,
      y,
      top: y,
      left: x,
      bottom: y + height,
      right: x + width,
      width,
      height,
      toJSON() {},
    } as DOMRect;
  });
}

// Ends the transitions of the elements, as far as the animations can tell
export function endTransitions(elements: Iterable<Element>): void {
  const list = Array.from(elements);
  for (let i = 0, len = list.length; i < len; ++i) {
    const element = list[i];
    element.dispatchEvent(new Event('transitionend'));
  }
}
