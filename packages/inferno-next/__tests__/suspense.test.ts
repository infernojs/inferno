import { describe, it, expect } from 'vitest';
import { mount, act } from './_helpers';
import {
  BasicSuspense, CatchRejection, RetryFromCatch, TwoUses, DeferredSwap,
  StateInsideTry, EffectAfterResolve, NestedSuspense, RejectVsPending,
  ReplayHookCache, EffectsSkippedForSuspended, NestedRevealOrder,
  SiblingBoundaries, ParallelInOneBoundary, WaterfallBody,
} from './_fixtures/suspense.tsrx';

interface Deferred<T> { promise: Promise<T>; resolve: (v: T) => void; reject: (e: any) => void; }
function deferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void, reject!: (e: any) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

describe('Suspense — basic', () => {
  it('shows pending fallback while use() awaits, then swaps to resolved content', async () => {
    const d = deferred<string>();
    const r = mount(BasicSuspense, { promise: d.promise });
    expect(r.find('.fallback').textContent).toBe('loading');
    expect(r.findAll('.resolved')).toHaveLength(0);

    await act(() => { d.resolve('hello'); });
    expect(r.findAll('.fallback')).toHaveLength(0);
    expect(r.find('.resolved').textContent).toBe('hello');
    r.unmount();
  });

  it('resolves synchronously when the promise is pre-tagged as fulfilled', () => {
    // React 19's cache()-returned promises ship with `.status='fulfilled'`
    // set ahead of use(); we accept the same shape so consumers can build
    // caches that bypass the suspend/resume cycle entirely.
    const p: any = Promise.resolve('already');
    p.status = 'fulfilled';
    p.value = 'already';
    const r = mount(BasicSuspense, { promise: p });
    expect(r.find('.resolved').textContent).toBe('already');
    expect(r.findAll('.fallback')).toHaveLength(0);
    r.unmount();
  });
});

describe('Suspense — catch on rejection', () => {
  it('routes rejection to catch (NOT pending)', async () => {
    const d = deferred<string>();
    const r = mount(CatchRejection, { promise: d.promise });
    expect(r.find('.fallback').textContent).toBe('loading');

    await act(() => { d.reject(new Error('boom')); });
    expect(r.findAll('.fallback')).toHaveLength(0);
    expect(r.findAll('.resolved')).toHaveLength(0);
    expect(r.find('.error').textContent).toBe('caught: boom');
    r.unmount();
  });

  it('catch reset() retries the try body with the latest props', async () => {
    // INFERNO-NEXT EXTENSION: the `@catch (err, reset)` positional `reset`
    // is an inferno-next-specific syntax. React's <ErrorBoundary> uses
    // `resetKeys` or an externally-supplied `resetErrorBoundary` callback
    // for the equivalent flow. Same intent (retry the failed branch with
    // fresh state), different surface. See SUSPENSE_DIVERGENCE.md.
    let d = deferred<string>();
    const r = mount(RetryFromCatch, { promise: d.promise });
    await act(() => { d.reject(new Error('first')); });
    expect(r.find('#retry').textContent).toBe('retry: first');

    // Supply a fresh promise via props, then click reset to retry.
    d = deferred<string>();
    r.update(RetryFromCatch, { promise: d.promise });
    expect(r.find('#retry').textContent).toBe('retry: first');  // catch still showing

    r.click('#retry');                  // reset → mountTry with new props
    expect(r.find('.fallback').textContent).toBe('loading');
    await act(() => { d.resolve('worked'); });
    expect(r.find('.resolved').textContent).toBe('worked');
    r.unmount();
  });
});

describe('Suspense — multiple use() calls', () => {
  it('caches resolved use() results across replay attempts', async () => {
    const da = deferred<string>();
    const db = deferred<string>();
    const r = mount(TwoUses, { a: da.promise, b: db.promise });
    expect(r.find('.fallback').textContent).toBe('loading');

    await act(() => { da.resolve('A'); });
    // First use(a) now resolved — but use(b) still pending → still loading.
    expect(r.findAll('.both')).toHaveLength(0);
    expect(r.find('.fallback').textContent).toBe('loading');

    await act(() => { db.resolve('B'); });
    expect(r.find('.both').textContent).toBe('A/B');
    r.unmount();
  });
});

describe('Suspense — state preservation', () => {
  it('useState inside try body persists across suspend → resolve cycles', async () => {
    const d = deferred<string>();
    const r = mount(StateInsideTry, { promise: d.promise });
    await act(() => { d.resolve('x'); });
    expect(r.find('#val').textContent).toBe('x:0');
    r.click('#inc');
    expect(r.find('#val').textContent).toBe('x:1');
    r.click('#inc');
    expect(r.find('#val').textContent).toBe('x:2');
    r.unmount();
  });
});

describe('Suspense — effect timing', () => {
  it('does NOT fire effects while pending; fires once on resolve', async () => {
    const d = deferred<string>();
    const log: string[] = [];
    const r = mount(EffectAfterResolve, { promise: d.promise, log });
    // Drain whatever was queued during mount — should be nothing since the
    // try body suspended before reaching useEffect.
    await act(() => {});
    expect(log).toEqual([]);

    await act(() => { d.resolve('payload'); });
    expect(log).toEqual(['mounted:payload']);
    r.unmount();
  });
});

describe('Suspense — nesting', () => {
  it('inner pending catches first; outer is unaffected', async () => {
    const d = deferred<string>();
    const r = mount(NestedSuspense, { promise: d.promise });
    expect(r.find('.outer').textContent).toBe('outer');
    expect(r.find('.inner-fallback').textContent).toBe('inner-loading');
    expect(r.findAll('.outer-fallback')).toHaveLength(0);

    await act(() => { d.resolve('I'); });
    expect(r.find('.outer').textContent).toBe('outer');
    expect(r.find('.inner').textContent).toBe('I');
    expect(r.findAll('.inner-fallback')).toHaveLength(0);
    r.unmount();
  });
});

describe('Suspense — pending vs catch isolation', () => {
  it('rejection goes through catch, not pending — even when pending exists', async () => {
    const d = deferred<string>();
    const r = mount(RejectVsPending, { promise: d.promise });
    expect(r.find('.fallback')).toBeTruthy();
    await act(() => { d.reject(new Error('nope')); });
    expect(r.find('.caught').textContent).toBe('rejected: nope');
    expect(r.findAll('.fallback')).toHaveLength(0);
    r.unmount();
  });
});

// ---------------------------------------------------------------------------
// React conformance — adapted from facebook/react ReactUse-test.js and
// ReactSuspenseWithNoopRenderer-test.js. The exact wording mirrors React's
// `it('...')` titles where reasonable so the source mapping is obvious.
// ---------------------------------------------------------------------------

describe('Suspense — React conformance', () => {
  it('reuses hooks computed during the previous attempt (State)', async () => {
    // Per ReactUse-test.js:933 — useState before use() preserves its state
    // across suspend/replay. Our setter even works AFTER the resolve.
    const d = deferred<string>();
    const r = mount(ReplayHookCache, { promise: d.promise });
    expect(r.find('.fallback').textContent).toBe('loading');
    await act(() => { d.resolve('R'); });
    expect(r.find('#val').textContent).toBe('R:0');
    r.click('#inc'); r.click('#inc');
    expect(r.find('#val').textContent).toBe('R:2');
    r.unmount();
  });

  it('does not call lifecycles of a suspended component (hooks)', async () => {
    // Per ReactSuspenseWithNoopRenderer-test.js:1582 — the suspended sibling's
    // useEffect MUST NOT fire while pending. Resolved siblings fire normally.
    const d = deferred<string>();
    const log: string[] = [];
    const r = mount(EffectsSkippedForSuspended, { promise: d.promise, log });
    await act(() => {});
    expect(log.includes('B-mount')).toBe(false);
    expect(log.includes('fallback-mount')).toBe(true);

    await act(() => { d.resolve('payload'); });
    // After resolve, B-mount fires; fallback-mount doesn't fire again.
    expect(log.filter(x => x === 'B-mount')).toEqual(['B-mount']);
    expect(r.find('.b').textContent).toBe('B:payload');
    r.unmount();
  });

  it('inner Suspense reveals AFTER outer resolves (nested boundaries)', async () => {
    // Per ReactUse-test.js:1096 — until the outer promise resolves, only the
    // outer fallback is visible; the inner boundary isn't even rendered yet.
    const da = deferred<string>();
    const db = deferred<string>();
    const r = mount(NestedRevealOrder, { a: da.promise, b: db.promise });
    expect(r.find('.a-loading').textContent).toBe('A-loading');
    expect(r.findAll('.b-loading')).toHaveLength(0);

    await act(() => { da.resolve('A!'); });
    expect(r.find('.a-resolved').textContent).toBe('A:A!');
    expect(r.find('.b-loading').textContent).toBe('B-loading');
    expect(r.findAll('.a-loading')).toHaveLength(0);

    await act(() => { db.resolve('B!'); });
    expect(r.find('.b-resolved').textContent).toBe('B:B!');
    expect(r.findAll('.b-loading')).toHaveLength(0);
    r.unmount();
  });

  it('using a rejected promise is caught by `catch`, not `pending`', async () => {
    // Mirrors ReactUse-test.js:266 — rejection is an Error, distinct from a
    // suspense signal; it routes to the error-boundary channel (`catch`).
    const d = deferred<string>();
    const r = mount(CatchRejection, { promise: d.promise });
    await act(() => { d.reject(new Error('Oops!')); });
    expect(r.find('.error').textContent).toBe('caught: Oops!');
    r.unmount();
  });

  it('use(thenable) is positional — second call returns its own value', async () => {
    // The "use returns each call's value independently" invariant — our
    // per-block thenableState[] keyed by call-order index is what makes this
    // work, mirroring React's per-fiber thenableState.
    const da = deferred<string>();
    const db = deferred<string>();
    const r = mount(TwoUses, { a: da.promise, b: db.promise });
    await act(() => { da.resolve('X'); });
    expect(r.findAll('.both')).toHaveLength(0);    // still waiting on b
    await act(() => { db.resolve('Y'); });
    expect(r.find('.both').textContent).toBe('X/Y');
    r.unmount();
  });
});

// ---------------------------------------------------------------------------
// Parallel boundaries — verify fetches kick off in parallel, NOT in a waterfall
// ---------------------------------------------------------------------------

describe('Suspense — parallel boundaries (no waterfall)', () => {
  it('sibling try blocks render their fallbacks in one outer pass; both promises in flight before either suspends', async () => {
    const da = deferred<string>();
    const db = deferred<string>();
    // Each call to .promise getter would create a new promise — by passing
    // the SAME pre-created promise into props, we model the "kick off before
    // render" pattern. The fetches are conceptually `fetchA()`/`fetchB()`
    // called in the parent scope.
    const r = mount(SiblingBoundaries, { a: da.promise, b: db.promise });
    // Both fallbacks visible — both boundaries suspended in the same pass.
    expect(r.find('.leaf-a-loading').textContent).toBe('A-loading');
    expect(r.find('.leaf-b-loading').textContent).toBe('B-loading');

    // Resolving B FIRST should not block A — independent boundaries.
    await act(() => { db.resolve('beta'); });
    expect(r.find('.leaf-b').textContent).toBe('B:beta');
    expect(r.find('.leaf-a-loading').textContent).toBe('A-loading');
    expect(r.findAll('.leaf-a')).toHaveLength(0);

    await act(() => { da.resolve('alpha'); });
    expect(r.find('.leaf-a').textContent).toBe('A:alpha');
    expect(r.find('.leaf-b').textContent).toBe('B:beta');
    r.unmount();
  });

  it('useMemo pattern: both fetches kick off on initial render (network-parallel)', async () => {
    // React parity confirmed: the useMemo factory runs EXACTLY ONCE for a
    // given `[cacheKey]` deps tuple, even across replay attempts. Our hooks
    // Map is preserved on the held tryBlock across suspend → resolve cycles,
    // and useMemo's slot-cache lookup hits on every replay. So `startA` and
    // `startB` are called once total — the docs previously listed this as
    // a divergence but empirical inspection (startA/startB call counters
    // checked at every resolve boundary) shows the counts are 1 each.
    //
    // The useMemo pattern guarantees BOTH fetches are initiated when the
    // body first runs (parallel), and the cached value flows through the
    // replays unchanged.
    let aStarts = 0, bStarts = 0;
    const da = deferred<string>();
    const db = deferred<string>();
    const startA = () => { aStarts++; return da.promise; };
    const startB = () => { bStarts++; return db.promise; };
    const r = mount(ParallelInOneBoundary, { startA, startB, cacheKey: 1 });

    // KEY ASSERTION: each fetch was started exactly ONCE. Even across the
    // two suspend/resolve cycles below, useMemo's slot cache holds — the
    // factory does NOT re-run on replay. Matches React's per-fiber
    // memoizedState preservation contract.
    expect(aStarts).toBe(1);
    expect(bStarts).toBe(1);
    expect(r.find('.fallback').textContent).toBe('loading');

    // Resolve in reverse order — useMemo cache holds, replay reads cached
    // promises, both `use()` calls eventually return their resolved values,
    // and the final render commits. startA / startB are STILL 1 each.
    await act(() => { db.resolve('B'); });
    await act(() => { da.resolve('A'); });
    expect(r.find('.both').textContent).toBe('A/B');
    expect(aStarts).toBe(1);
    expect(bStarts).toBe(1);
    r.unmount();
  });

  it('WITHOUT useMemo, sequential use() inside one body waterfalls (documents the gotcha)', async () => {
    // KNOWN DIVERGENCE FROM REACT: this is a regression-pin for inferno-
    // next's current sequential-replay strategy — NOT a React-canonical
    // contract. React's runtime would also waterfall in this pattern (the
    // first use() must resolve before the body re-runs past it), so the
    // shape of the divergence is more about inferno-next's per-replay
    // call counts than about user-visible behavior. See
    // SUSPENSE_DIVERGENCE.md for the full picture.
    //
    // This test exists to make the waterfall explicit so future contributors
    // understand the constraint — and so any future optimization that
    // accidentally fixes it (e.g. running siblings speculatively) will fail
    // this test and force a conscious decision.
    let aStarts = 0, bStarts = 0;
    const da = deferred<string>(), db = deferred<string>();
    const startA = () => { aStarts++; return da.promise; };
    const startB = () => { bStarts++; return db.promise; };

    const r = mount(WaterfallBody, { startA, startB });
    // First render: startA() called (suspends), startB() never reached.
    expect(aStarts).toBe(1);
    expect(bStarts).toBe(0);                                     // waterfall — B not started
    expect(r.find('.fallback').textContent).toBe('loading');

    // Resolve A → replay starts. On replay startA() is called again (returns
    // the SAME pending promise so use() reads its cached fulfilled value),
    // and NOW startB() is reached for the first time.
    await act(() => { da.resolve('A'); });
    expect(aStarts).toBe(2);
    expect(bStarts).toBe(1);                                     // only NOW does B start
    expect(r.find('.fallback').textContent).toBe('loading');     // still suspended on B

    await act(() => { db.resolve('B'); });
    expect(r.find('.both').textContent).toBe('A/B');
    r.unmount();
  });
});

describe('Suspense — useDeferredValue (React 18 stale-data pattern)', () => {
  it('returns previous value while new value suspends; commits on microtask', async () => {
    const d1 = deferred<string>();
    const r = mount(DeferredSwap, { promise: d1.promise });
    expect(r.find('.fallback').textContent).toBe('first load');
    await act(() => { d1.resolve('first-data'); });
    expect(r.find('.data').textContent).toBe('first-data');
    expect(r.find('.data').className).toBe('data fresh');

    // Update with a NEW pending promise. On the FIRST render after the prop
    // change, useDeferredValue returns the PREVIOUS value (d1.promise), so
    // use() reads the cached fulfilled state (no suspend) AND `props !== deferred`
    // flips the class to 'stale'. A microtask later, useDeferredValue commits
    // the new value; that re-render suspends → fallback shows briefly until
    // d2 resolves and the body completes.
    const d2 = deferred<string>();
    r.update(DeferredSwap, { promise: d2.promise });
    expect(r.find('.data').textContent).toBe('first-data');     // old value still
    expect(r.find('.data').className).toBe('data stale');       // stale flag set

    await act(() => { d2.resolve('second-data'); });
    expect(r.find('.data').textContent).toBe('second-data');
    expect(r.find('.data').className).toBe('data fresh');
    r.unmount();
  });
});
