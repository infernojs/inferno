import { describe, it, expect } from 'vitest';
import { mount, act } from './_helpers';
import {
  TransitionBasics, TransitionKeepsDom, StandaloneStartTransition,
  DeferredValueWithSuspense, UrgentPreemptsTransition,
  EntangledTransitions, IsPendingThroughReplay, NestedTransitions,
  DeferredValueInTransition, UrgentSupersedesTransition,
} from './_fixtures/transitions.tsrx';

interface Deferred<T> { promise: Promise<T>; resolve: (v: T) => void; reject: (e: any) => void; }
function deferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void, reject!: (e: any) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

describe('useTransition — basics', () => {
  it('returns [isPending=false, start]; start runs fn and tags renders as transition', async () => {
    const r = mount(TransitionBasics);
    expect(r.find('#n').textContent).toBe('0');
    expect(r.find('#pending').textContent).toBe('idle');

    // Urgent setter: synchronous, no transition.
    r.click('#bump-urgent');
    expect(r.find('#n').textContent).toBe('1');
    expect(r.find('#pending').textContent).toBe('idle');

    // Transition setter: isPending flips true synchronously (in the same
    // commit that increments n), then back to false after the microtask.
    r.click('#bump-transition');
    expect(r.find('#n').textContent).toBe('11');
    expect(r.find('#pending').textContent).toBe('pending');
    await act(() => {});
    expect(r.find('#pending').textContent).toBe('idle');
    r.unmount();
  });
});

describe('useTransition — keeps prior DOM during suspended transition', () => {
  it('on swap, OLD value stays visible while NEW promise loads; isPending=true throughout', async () => {
    const d1 = deferred<string>();
    const d2 = deferred<string>();
    // d1 already resolved up front so initial render commits without suspense.
    d1.resolve('one');
    await Promise.resolve();
    const r = mount(TransitionKeepsDom, { initialPromise: d1.promise, nextPromise: d2.promise });
    await act(() => {});
    expect(r.find('#value').textContent).toBe('one');
    expect(r.find('#pending').textContent).toBe('idle');
    expect(r.findAll('#fallback')).toHaveLength(0);

    // Swap inside startTransition. d2 is still pending — the render suspends
    // but DOM stays mounted (no fallback) and isPending flips true.
    r.click('#swap');
    expect(r.find('#value').textContent).toBe('one');                // OLD value held
    expect(r.findAll('#fallback')).toHaveLength(0);                  // no fallback flash
    expect(r.find('#pending').textContent).toBe('pending');

    // Resolve d2 — DOM updates to new value, isPending returns to idle.
    await act(() => { d2.resolve('two'); });
    expect(r.find('#value').textContent).toBe('two');
    expect(r.find('#pending').textContent).toBe('idle');
    r.unmount();
  });

  it('initial mount that suspends — even inside a transition — still shows fallback', async () => {
    // First load has no prior content to keep. Transition or not, the
    // pending fallback must show on initial suspend.
    const d = deferred<string>();
    const r = mount(TransitionKeepsDom, { initialPromise: d.promise, nextPromise: d.promise });
    expect(r.find('#fallback').textContent).toBe('fallback');
    await act(() => { d.resolve('first'); });
    expect(r.find('#value').textContent).toBe('first');
    r.unmount();
  });
});

describe('startTransition — standalone function', () => {
  it('matches useTransition.start for suspense behavior', async () => {
    const d1 = deferred<string>();
    const d2 = deferred<string>();
    d1.resolve('alpha');
    await Promise.resolve();
    const r = mount(StandaloneStartTransition, { initialPromise: d1.promise, nextPromise: d2.promise });
    await act(() => {});
    expect(r.find('#value').textContent).toBe('alpha');

    r.click('#swap');
    expect(r.find('#value').textContent).toBe('alpha');              // kept
    expect(r.findAll('#fallback')).toHaveLength(0);

    await act(() => { d2.resolve('beta'); });
    expect(r.find('#value').textContent).toBe('beta');
    r.unmount();
  });
});

describe('useDeferredValue — transition-priority deferral', () => {
  it('returns previous value with isStale=true; deferred commit suspends without tearing down', async () => {
    const d1 = deferred<string>();
    const d2 = deferred<string>();
    d1.resolve('first');
    await Promise.resolve();
    const r = mount(DeferredValueWithSuspense, { promise: d1.promise });
    await act(() => {});
    expect(r.find('#value').textContent).toBe('first');
    expect(r.find('#value').className).toBe('fresh');

    // Update with a new pending promise. The FIRST render returns the prior
    // value via useDeferredValue (no suspend; stale flag set). A microtask
    // later, useDeferredValue commits the new value via startTransition;
    // that suspends but keeps the prior DOM.
    r.update(DeferredValueWithSuspense, { promise: d2.promise });
    expect(r.find('#value').textContent).toBe('first');              // prior value
    expect(r.find('#value').className).toBe('stale');                // stale flag
    expect(r.findAll('#fallback')).toHaveLength(0);                  // no fallback flash

    await act(() => { d2.resolve('second'); });
    expect(r.find('#value').textContent).toBe('second');
    expect(r.find('#value').className).toBe('fresh');
    expect(r.findAll('#fallback')).toHaveLength(0);
    r.unmount();
  });
});

describe('useTransition — urgent preempts', () => {
  it('an urgent setter after a transition setter forces fallback on suspend', async () => {
    const d1 = deferred<string>();
    const d2 = deferred<string>();
    d1.resolve('alpha');
    await Promise.resolve();
    const r = mount(UrgentPreemptsTransition, { initialPromise: d1.promise, nextPromise: d2.promise });
    await act(() => {});
    expect(r.find('#value').textContent).toBe('alpha');

    // Urgent swap: no transition wrapping → suspending render falls back to
    // the pending arm immediately (no DOM preservation).
    r.click('#swap-urgent');
    expect(r.find('#fallback').textContent).toBe('fallback');
    expect(r.findAll('#value')).toHaveLength(0);
    r.unmount();
  });
});

// ---------------------------------------------------------------------------
// React edge-case ports — cited inline with their `it(...)` titles from
// facebook/react. These exercise behaviors that distinguish "transitions
// work for one promise" from "transitions correctly entangle multiple
// suspensions".
// ---------------------------------------------------------------------------

describe('Transitions — multiple-suspend edge cases', () => {
  it('entangles sibling boundaries: isPending stays true until ALL siblings resolve', async () => {
    // Port of ReactTransition-test.js:190 "multiple transitions update
    // different queues, they entangle". A single startTransition causes two
    // sibling try-blocks to suspend; isPending must remain true until both
    // promises resolve.
    //
    // KNOWN DIVERGENCE FROM REACT: inferno-next EAGERLY COMMITS each
    // sibling as its individual promise resolves (assertion at line 181
    // checks A:a2 while B is still pending). React's contract is "full
    // wait" — both siblings keep their old content until BOTH resolve, so
    // the user never sees a half-updated screen mid-transition. We match
    // React on isPending (stays true until both resolve), on prior-DOM
    // preservation (no fallback flash), and on the entanglement of the
    // counter; we diverge on the per-sibling commit timing. See
    // SUSPENSE_DIVERGENCE.md for context.
    const da1 = deferred<string>(), db1 = deferred<string>();
    const da2 = deferred<string>(), db2 = deferred<string>();
    da1.resolve('a1'); db1.resolve('b1');
    await Promise.resolve();
    const r = mount(EntangledTransitions, {
      initialA: da1.promise, initialB: db1.promise,
      nextA: da2.promise, nextB: db2.promise,
    });
    await act(() => {});
    expect(r.find('.ent-a').textContent).toBe('A:a1');
    expect(r.find('.ent-b').textContent).toBe('B:b1');
    expect(r.find('#pending').textContent).toBe('0');

    // Trigger entangled transition.
    r.click('#swap-both');
    expect(r.find('#pending').textContent).toBe('1');
    // OLD values held; no fallback shown for either sibling.
    expect(r.find('.ent-a').textContent).toBe('A:a1');
    expect(r.find('.ent-b').textContent).toBe('B:b1');
    expect(r.findAll('.ent-a-load')).toHaveLength(0);
    expect(r.findAll('.ent-b-load')).toHaveLength(0);

    // Resolve A only: A updates, B still pending, isPending still 1.
    await act(() => { da2.resolve('a2'); });
    expect(r.find('.ent-a').textContent).toBe('A:a2');
    expect(r.find('.ent-b').textContent).toBe('B:b1');  // STILL old
    expect(r.find('#pending').textContent).toBe('1');

    // Resolve B: B updates, isPending finally drops.
    await act(() => { db2.resolve('b2'); });
    expect(r.find('.ent-b').textContent).toBe('B:b2');
    expect(r.find('#pending').textContent).toBe('0');
    r.unmount();
  });

  it('isPending stays true across replay when a second use() suspends in the same body', async () => {
    // Port of ReactUse-test.js:1446 "does not get stuck in pending state
    // after `use` suspends". The body has TWO use() calls; the first
    // resolves and triggers replay, the second then suspends. isPending
    // must remain true through both suspensions, and the DOM must stay
    // mounted (no fallback) for the entire transition.
    const a1 = deferred<string>(), b1 = deferred<string>();
    const a2 = deferred<string>(), b2 = deferred<string>();
    a1.resolve('A1'); b1.resolve('B1');
    await Promise.resolve();
    const r = mount(IsPendingThroughReplay, {
      initialA: a1.promise, initialB: b1.promise,
      nextA: a2.promise, nextB: b2.promise,
    });
    await act(() => {});
    expect(r.find('#value').textContent).toBe('A1/B1');
    expect(r.find('#pending').textContent).toBe('0');

    r.click('#swap');
    // First use(a2) is pending. DOM held, isPending true.
    expect(r.find('#value').textContent).toBe('A1/B1');
    expect(r.findAll('#fallback')).toHaveLength(0);
    expect(r.find('#pending').textContent).toBe('1');

    // Resolve A2: replay re-enters the body. First use() returns A2 from
    // cache. Second use(b2) now suspends. DOM must STILL stay held.
    await act(() => { a2.resolve('A2'); });
    expect(r.find('#value').textContent).toBe('A1/B1');  // still old
    expect(r.findAll('#fallback')).toHaveLength(0);      // NO fallback flash
    expect(r.find('#pending').textContent).toBe('1');    // still pending

    await act(() => { b2.resolve('B2'); });
    expect(r.find('#value').textContent).toBe('A2/B2');
    expect(r.find('#pending').textContent).toBe('0');
    r.unmount();
  });

  it('nested startTransition — BOTH useTransition hooks see isPending=true', async () => {
    // Port of ReactTransition-test.js:923 "tracks two pending flags for
    // nested startTransition". Both flags must be true while the inner
    // transition is processing, both flip to false on commit.
    const r = mount(NestedTransitions, { target: 42 });
    expect(r.find('#pending-a').textContent).toBe('A:0');
    expect(r.find('#pending-b').textContent).toBe('B:0');
    expect(r.find('#n').textContent).toBe('0');

    r.click('#nest');
    // Synchronously after the click: setN(42) committed at transition prio.
    // Both useTransition hooks observe the global pending count > 0.
    expect(r.find('#n').textContent).toBe('42');
    expect(r.find('#pending-a').textContent).toBe('A:1');
    expect(r.find('#pending-b').textContent).toBe('B:1');

    // After the microtask drain: both transitions release, both flags flip.
    await act(() => {});
    expect(r.find('#pending-a').textContent).toBe('A:0');
    expect(r.find('#pending-b').textContent).toBe('B:0');
    r.unmount();
  });

  it('urgent setState during a suspended transition discards the transition (no clobber on resolve)', async () => {
    // Port of ReactUse-test.js:1631 "updates while component is suspended
    // should not be mistaken for render phase updates". When a transition
    // suspends on promise B and an urgent setter swaps to promise C, the
    // transition is superseded: isPending drops, C commits, and when B
    // eventually resolves nothing happens (the retry no-ops because we
    // cleared `pendingThenable` on the urgent commit).
    const initial = deferred<string>();
    const transP = deferred<string>();
    const urgentP: any = Promise.resolve('C');
    urgentP.status = 'fulfilled'; urgentP.value = 'C';
    initial.resolve('A');
    await Promise.resolve();
    const r = mount(UrgentSupersedesTransition, {
      initialPromise: initial.promise,
      transitionPromise: transP.promise,
      urgentPromise: urgentP,
    });
    await act(() => {});
    expect(r.find('#value').textContent).toBe('A');
    expect(r.find('#pending').textContent).toBe('0');

    // Start the transition (suspends on B).
    r.click('#swap-trans');
    expect(r.find('#value').textContent).toBe('A');           // old held
    expect(r.findAll('#fallback')).toHaveLength(0);
    expect(r.find('#pending').textContent).toBe('1');

    // Urgent supersede: setPromise(C). C is pre-tagged fulfilled so the
    // urgent render commits SYNCHRONOUSLY with C visible. The held suspend
    // counter is released immediately; the transition's own outstanding
    // counter drains on the next microtask.
    r.click('#swap-urgent');
    expect(r.find('#value').textContent).toBe('C');           // urgent committed
    expect(r.findAll('#fallback')).toHaveLength(0);
    // Drain the startTransition's queued microtask decrement — same shape as
    // React's tests, which await act() between flushSync and the assertion.
    await act(() => {});
    expect(r.find('#pending').textContent).toBe('0');         // transition discarded

    // Now resolve the OLD transition promise B. Nothing should happen:
    // the retry's pendingThenable check returns early because we cleared it
    // when the urgent render committed.
    await act(() => { transP.resolve('B'); });
    expect(r.find('#value').textContent).toBe('C');           // still C, not B
    expect(r.find('#pending').textContent).toBe('0');
    r.unmount();
  });

  it('useDeferredValue does NOT defer when called during a transition render', async () => {
    // Port of ReactDeferredValue-test.js:108 "does not defer during a
    // transition". When the source render is already transition-priority,
    // useDeferredValue should commit the new value in the SAME pass
    // (Original and Deferred both update together).
    const r = mount(DeferredValueInTransition);
    expect(r.find('#original').textContent).toBe('Original: 1');
    expect(r.find('#deferred').textContent).toBe('Deferred: 1');

    // Bump via transition — both should update together.
    r.click('#bump');
    expect(r.find('#original').textContent).toBe('Original: 2');
    expect(r.find('#deferred').textContent).toBe('Deferred: 2');  // NOT 1!
    r.unmount();
  });
});
