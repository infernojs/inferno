import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, act } from '../_helpers';
import {
  setTransitionFallbackTimeout,
  getTransitionFallbackTimeout,
} from '../../src/index.js';
import { TimeoutFallback } from './_fixtures/transition-timeout.tsrx';

interface Deferred<T> { promise: Promise<T>; resolve: (v: T) => void; reject: (e: any) => void; }
function deferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void, reject!: (e: any) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

// ============================================================================
// Suspense Gap #6 — transition-timeout fallback
// ============================================================================
// Pins the lifecycle a transition goes through when its promise outlives the
// fallback budget. Uses Vitest's fake-timer rig to advance the clock past
// the threshold deterministically.
describe('useTransition — transition-timeout fallback', () => {
  beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: false }); });
  afterEach(() => { vi.useRealTimers(); });

  it('eventually swaps to @pending after the configured timeout AND restores try DOM on resolve', async () => {
    // Mirrors ReactSuspenseWithNoopRenderer-test.js "eventually shows fallback
    // if transition takes too long". Set the timeout to 100ms so the test
    // doesn't have to fake-advance 5 real seconds; the contract is identical.
    const prevTimeout = getTransitionFallbackTimeout();
    setTransitionFallbackTimeout(100);
    try {
      const initial = deferred<string>();
      initial.resolve('first');
      const next = deferred<string>();
      const r = mount(TimeoutFallback, {
        initialPromise: initial.promise,
        nextPromise: next.promise,
      });
      await act(() => {});
      expect(r.find('.leaf').textContent).toBe('first');
      expect(r.find('#pending').textContent).toBe('0');
      expect(r.findAll('#fallback')).toHaveLength(0);

      // Kick off the transition — prior DOM stays mounted, pending=1, no fallback yet.
      await act(() => { r.click('#swap'); });
      expect(r.find('.leaf').textContent).toBe('first');
      expect(r.find('#pending').textContent).toBe('1');
      expect(r.findAll('#fallback')).toHaveLength(0);

      // Advance time PAST the timeout — the runtime swaps to @pending.
      // isPending stays true (the transition is still in progress).
      await act(() => { vi.advanceTimersByTime(150); });
      expect(r.findAll('.leaf')).toHaveLength(0);
      expect(r.find('#fallback').textContent).toBe('pending-shown');
      expect(r.find('#pending').textContent).toBe('1');

      // Promise resolves AFTER the fallback was shown — the saved try-body
      // re-attaches with the resolved value AND isPending drops to false.
      await act(() => { next.resolve('second'); });
      expect(r.findAll('#fallback')).toHaveLength(0);
      expect(r.find('.leaf').textContent).toBe('second');
      expect(r.find('#pending').textContent).toBe('0');
      r.unmount();
    } finally {
      setTransitionFallbackTimeout(prevTimeout);
    }
  });

  it('promise resolves BEFORE the timeout — fallback never shows, prior DOM kept all the way', async () => {
    // The fast-resolve path: the retry runs before the timeout fires, so
    // clearTimeout cancels the pending fallback swap.
    const prevTimeout = getTransitionFallbackTimeout();
    setTransitionFallbackTimeout(100);
    try {
      const initial = deferred<string>();
      initial.resolve('first');
      const next = deferred<string>();
      const r = mount(TimeoutFallback, {
        initialPromise: initial.promise,
        nextPromise: next.promise,
      });
      await act(() => {});

      await act(() => { r.click('#swap'); });
      expect(r.find('.leaf').textContent).toBe('first');
      expect(r.find('#pending').textContent).toBe('1');

      // Resolve fast — well before the 100ms budget.
      await act(() => {
        vi.advanceTimersByTime(20);                           // 20ms < 100ms
        next.resolve('second');
      });
      expect(r.findAll('#fallback')).toHaveLength(0);
      expect(r.find('.leaf').textContent).toBe('second');
      expect(r.find('#pending').textContent).toBe('0');

      // Advance past where the timeout WOULD HAVE fired — no fallback flicker.
      await act(() => { vi.advanceTimersByTime(200); });
      expect(r.findAll('#fallback')).toHaveLength(0);
      r.unmount();
    } finally {
      setTransitionFallbackTimeout(prevTimeout);
    }
  });

  it('setTransitionFallbackTimeout(Infinity) keeps the prior DOM forever (legacy hold)', async () => {
    // The opt-out path: setting the timeout to Infinity means the runtime
    // NEVER swaps to fallback. Useful for tests / UIs that prefer staleness
    // over visual disruption.
    const prevTimeout = getTransitionFallbackTimeout();
    setTransitionFallbackTimeout(Infinity);
    try {
      const initial = deferred<string>();
      initial.resolve('first');
      const next = deferred<string>();
      const r = mount(TimeoutFallback, {
        initialPromise: initial.promise,
        nextPromise: next.promise,
      });
      await act(() => {});
      await act(() => { r.click('#swap'); });
      expect(r.find('.leaf').textContent).toBe('first');
      expect(r.find('#pending').textContent).toBe('1');

      // Advance time WAY past where any sensible timeout would fire.
      await act(() => { vi.advanceTimersByTime(60_000); });
      expect(r.findAll('#fallback')).toHaveLength(0);
      expect(r.find('.leaf').textContent).toBe('first');
      expect(r.find('#pending').textContent).toBe('1');

      // Eventually resolve — content swaps in cleanly.
      await act(() => { next.resolve('second'); });
      expect(r.find('.leaf').textContent).toBe('second');
      expect(r.find('#pending').textContent).toBe('0');
      r.unmount();
    } finally {
      setTransitionFallbackTimeout(prevTimeout);
    }
  });

  it('default timeout is 5000ms', () => {
    // Pin the default constant so a future change is intentional.
    expect(getTransitionFallbackTimeout()).toBe(5000);
  });
});
