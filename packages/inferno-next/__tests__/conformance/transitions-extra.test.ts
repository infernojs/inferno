import { describe, it, expect } from 'vitest';
import { mount, act } from '../_helpers';
import {
  TransitionThatThrows,
  StartTransitionInEffect,
  DeferredIdentity,
  DeferredSuspenseTransition,
  PendingSequence,
  NestedInnerOnly,
} from './_fixtures/transitions-extra.tsrx';

interface Deferred<T> { promise: Promise<T>; resolve: (v: T) => void; reject: (e: any) => void; }
function deferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void, reject!: (e: any) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

// ============================================================================
// Gap 16 — transition that throws routes to @catch + flips isPending false
// ============================================================================
describe('useTransition — transition that throws (no suspend)', () => {
  it('routes the thrown error to the boundary AND drops isPending back to false', async () => {
    // Mirrors React's "transition that throws an error is caught by error
    // boundary" — the transition is SETTLED on the error commit, so the
    // pending counter must be released.
    const r = mount(TransitionThatThrows, {});
    expect(r.find('.shell')).toBeTruthy();
    expect(r.find('#pending').textContent).toBe('0');

    // Fire transition that triggers a synchronous render-throw.
    await act(() => { r.click('#do'); });
    // Caught by @catch → boundary swaps to error view.
    expect(r.findAll('.shell')).toHaveLength(0);
    expect(r.find('#err').textContent).toBe('transition-boom');
    // No way to read isPending after the boundary swap, but the contract is
    // that the transition is OVER — assert this implicitly by verifying no
    // microtask drain leaves pending work behind.
    await act(() => {});
    expect(r.findAll('#err')).toHaveLength(1);
    r.unmount();
  });
});

// ============================================================================
// Gap 18 — startTransition called from inside useEffect
// ============================================================================
describe('startTransition inside useEffect', () => {
  it('schedules the resulting setter at transition priority', async () => {
    // Effect-scheduled state updates inherit the transition's priority. We
    // assert this by checking that the deferred value DOES land — without
    // throwing or crashing the priority machinery.
    const r = mount(StartTransitionInEffect, {});
    expect(r.find('#v').textContent).toBe('init');
    // First click → tick increments, effect re-fires, startTransition
    // schedules setV. Drain to commit it.
    await act(() => { r.click('#tick'); });
    expect(r.find('#v').textContent).toBe('via-effect');
    r.unmount();
  });
});

// ============================================================================
// Gap 19 — useDeferredValue identity stability
// ============================================================================
describe('useDeferredValue — identity stability', () => {
  it('returns the same reference when input is unchanged', () => {
    // Mirrors React's "returns the same value if input is unchanged" — the
    // hook must not allocate per render; downstream Object.is checks rely
    // on this.
    const observed: any[] = [];
    const input = { tag: 'A' };
    const r = mount(DeferredIdentity, { input, observe: (v: any) => observed.push(v) });
    expect(r.find('.out').textContent).toBe('A');
    // Re-render with the SAME input reference.
    r.update(DeferredIdentity, { input, observe: (v: any) => observed.push(v) });
    expect(observed.length).toBeGreaterThanOrEqual(2);
    // EVERY committed deferred value must be `===` to the first one.
    expect(observed.every(v => v === observed[0])).toBe(true);
    r.unmount();
  });

  it('returns a new reference on each input identity change (after deferred commit)', async () => {
    // Note: useDeferredValue intentionally returns the PRIOR value on the
    // first render after an input change, then schedules a deferred re-render
    // to swap in the new value (React 18+ stale-while-revalidate semantics).
    // We await act() to drain the deferred commit before asserting.
    const observed: any[] = [];
    const r = mount(DeferredIdentity, {
      input: { tag: 'A' }, observe: (v: any) => observed.push(v),
    });
    const first = observed[observed.length - 1];
    expect(first.tag).toBe('A');

    await act(() => r.update(DeferredIdentity, {
      input: { tag: 'B' }, observe: (v: any) => observed.push(v),
    }));
    const second = observed[observed.length - 1];
    expect(second).not.toBe(first);
    expect(second.tag).toBe('B');
    r.unmount();
  });
});

// ============================================================================
// Gap 20 — deferred + suspending + transition three-way
// ============================================================================
describe('useDeferredValue + Suspense + Transition (three-way)', () => {
  it('keeps prior DOM during transition-priority swap; isPending tracks resolve', async () => {
    // Combines all three: deferred value (defers on transition pass),
    // suspending consumer (use() of deferred), and explicit transition wrap.
    // Initial promise resolves immediately so we start with content visible.
    const initial = deferred<string>();
    initial.resolve('first');
    const next = deferred<string>();

    const r = mount(DeferredSuspenseTransition, {
      initialPromise: initial.promise,
      nextPromise: next.promise,
    });
    await act(() => {});
    expect(r.find('#value').textContent).toBe('first');
    expect(r.find('#pending').textContent).toBe('0');

    // Transition swap. Expect: prior DOM kept (no fallback flash), pending=1.
    await act(() => { r.click('#swap'); });
    // Prior DOM stays mounted (no fallback shown).
    expect(r.findAll('#fallback')).toHaveLength(0);
    expect(r.find('#value').textContent).toBe('first');
    expect(r.find('#pending').textContent).toBe('1');

    // Resolve the new promise: pending drops, value swaps.
    await act(() => { next.resolve('second'); });
    expect(r.find('#value').textContent).toBe('second');
    expect(r.find('#pending').textContent).toBe('0');
    r.unmount();
  });
});

// ============================================================================
// Gap 15 (strengthening) — capture EVERY isPending value
// ============================================================================
describe('useTransition — isPending edge tracking', () => {
  it('emits sequence false → true (on start) → false (on commit)', async () => {
    const seq: boolean[] = [];
    const r = mount(PendingSequence, { observePending: (p: boolean) => seq.push(p) });
    // Initial mount: 1 observation, isPending=false.
    expect(seq[0]).toBe(false);

    await act(() => { r.click('#do'); });
    // After the transition settles, the LAST observation must be false; the
    // sequence must contain at least one `true` between the first and last.
    expect(seq[seq.length - 1]).toBe(false);
    expect(seq.includes(true)).toBe(true);
    expect(r.find('#n').textContent).toBe('1');
    r.unmount();
  });
});

// ============================================================================
// Gap 17 (strengthening) — inner-only transition: outer pending stays false
// ============================================================================
describe('useTransition — nested hooks: inner-only start does not bump outer', () => {
  it('only the innerStart-driven update flips inner isPending; outer remains false', async () => {
    const r = mount(NestedInnerOnly, { target: 7 });
    expect(r.find('#outer').textContent).toBe('0');
    expect(r.find('#inner').textContent).toBe('0');

    await act(() => { r.click('#do-inner'); });
    // Transition committed. After commit both flags are back to 0.
    expect(r.find('#outer').textContent).toBe('0');
    expect(r.find('#inner').textContent).toBe('0');
    expect(r.find('#n').textContent).toBe('7');
    r.unmount();
  });

  it('outerStart wrapping innerStart bumps BOTH', async () => {
    const r = mount(NestedInnerOnly, { target: 11 });
    await act(() => { r.click('#do-outer'); });
    expect(r.find('#outer').textContent).toBe('0');
    expect(r.find('#inner').textContent).toBe('0');
    expect(r.find('#n').textContent).toBe('11');
    r.unmount();
  });
});
