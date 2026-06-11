import { describe, it, expect } from 'vitest';
import { mount, act } from '../_helpers';
import {
  UseInsideMemo,
  PendingThrowBubblesUp,
  DeferredWithInitial,
} from './_fixtures/suspense-blocked.tsrx';

interface Deferred<T> { promise: Promise<T>; resolve: (v: T) => void; reject: (e: any) => void; }
function deferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void, reject!: (e: any) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

// ============================================================================
// Gap 7 — use() inside useMemo
// ============================================================================
describe('Suspense — use() inside a useMemo factory', () => {
  it('suspend in memo factory routes to @pending; resolved value flows out of the memo', async () => {
    // Mirrors ReactUse-test.js — `use()` is allowed anywhere in render,
    // including inside `useMemo`. The suspend propagates out and the
    // committed value is the memoized result of the resolved promise.
    const d = deferred<string>();
    const r = mount(UseInsideMemo, { promise: d.promise, depKey: 'k1' });
    expect(r.find('.fallback').textContent).toBe('pending');

    await act(() => { d.resolve('hello'); });
    expect(r.findAll('.fallback')).toHaveLength(0);
    expect(r.find('.resolved').textContent).toBe('m:hello');
    r.unmount();
  });
});

// ============================================================================
// Gap 8 — throw inside @pending bubbles up
// ============================================================================
describe('Suspense — @pending body throws → bubbles to outer boundary', () => {
  it('outer @catch catches the fallback-throw error', () => {
    // Mirrors React's "throws if fallback throws" — a fallback that itself
    // throws must propagate to the nearest enclosing error boundary, not get
    // silently absorbed.
    const d = deferred<string>();
    const r = mount(PendingThrowBubblesUp, { promise: d.promise });
    expect(r.findAll('.resolved')).toHaveLength(0);
    expect(r.findAll('.fallback-ok')).toHaveLength(0);
    expect(r.find('.outer-caught').textContent).toBe('fallback-boom');
    r.unmount();
  });
});

// ============================================================================
// Gap 21 — useDeferredValue with React-19 initialValue overload
// ============================================================================
describe('useDeferredValue — initialValue (React 19 overload)', () => {
  it('first render returns initialValue, then commits real value on microtask', async () => {
    // Mirrors ReactDeferredValue-test.js "useDeferredValue with initialValue"
    // — when both args are given AND they differ, the first render returns
    // initialValue and a deferred re-render commits `value`.
    const observed: any[] = [];
    const realValue = { tag: 'real' };
    const initial = { tag: 'init' };
    const r = mount(DeferredWithInitial, {
      value: realValue, initialValue: initial,
      observe: (v: any) => observed.push(v),
    });
    // First render: initialValue is what the consumer sees.
    expect(observed[0]).toBe(initial);
    expect(r.find('.out').textContent).toBe('init');

    // Drain — the scheduled microtask commits the real value.
    await act(() => {});
    expect(observed[observed.length - 1]).toBe(realValue);
    expect(r.find('.out').textContent).toBe('real');
    r.unmount();
  });

  it('when initialValue === value, returns value immediately (no deferred re-render)', async () => {
    const observed: any[] = [];
    const v = { tag: 'same' };
    const r = mount(DeferredWithInitial, {
      value: v, initialValue: v,
      observe: (x: any) => observed.push(x),
    });
    // No deferred commit needed — only one observation, with the value.
    expect(observed).toEqual([v]);
    expect(r.find('.out').textContent).toBe('same');
    await act(() => {});
    // Still just one — no spurious deferred re-render fired.
    expect(observed).toEqual([v]);
    r.unmount();
  });

  it('subsequent renders track the input via the existing useDeferredValue semantics', async () => {
    // After the initial-value pass completes, re-renders behave exactly like
    // single-arg useDeferredValue: the prior committed value is returned
    // until microtask drain commits the new one.
    const observed: any[] = [];
    const v1 = { tag: 'v1' };
    const init = { tag: 'init' };
    const r = mount(DeferredWithInitial, {
      value: v1, initialValue: init,
      observe: (x: any) => observed.push(x),
    });
    await act(() => {});
    expect(observed[observed.length - 1]).toBe(v1);

    const v2 = { tag: 'v2' };
    await act(() => r.update(DeferredWithInitial, {
      value: v2, initialValue: init,
      observe: (x: any) => observed.push(x),
    }));
    expect(observed[observed.length - 1]).toBe(v2);
    r.unmount();
  });
});
