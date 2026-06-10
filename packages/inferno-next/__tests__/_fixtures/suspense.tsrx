import { use, useState, useEffect, useMemo, useDeferredValue } from 'inferno-next';

// ---------------------------------------------------------------------------
// Basic Suspense flow — try/pending/catch with a use(promise) inside try.
// ---------------------------------------------------------------------------
export function BasicSuspense(props) @{
  <>
    @try {
      const value = use(props.promise);
      <div class='resolved'>{value as string}</div>
    } @pending {
      <div class='fallback'>{'loading'}</div>
    }
  </>
}

// `use` of a rejected promise rethrows the reason — caught by `catch`,
// independent from the `pending` arm.
export function CatchRejection(props) @{
  <>
    @try {
      const value = use(props.promise);
      <div class='resolved'>{value as string}</div>
    } @pending {
      <div class='fallback'>{'loading'}</div>
    } @catch (err) {
      <div class='error'>{('caught: ' + err.message) as string}</div>
    }
  </>
}

// Resetting from catch re-tries the try body — useful for retry buttons.
export function RetryFromCatch(props) @{
  <>
    @try {
      const value = use(props.promise);
      <div class='resolved'>{value as string}</div>
    } @pending {
      <div class='fallback'>{'loading'}</div>
    } @catch (err, reset) {
      <button id='retry' onClick={reset}>{('retry: ' + err.message) as string}</button>
    }
  </>
}

// Multiple use() calls — should all suspend and resolve in order. On replay,
// earlier resolved use() calls return synchronously from cache.
export function TwoUses(props) @{
  <>
    @try {
      const a = use(props.a);
      const b = use(props.b);
      <div class='both'>{(a + '/' + b) as string}</div>
    } @pending {
      <div class='fallback'>{'loading'}</div>
    }
  </>
}

// useDeferredValue + use() — the React-idiomatic stale-data pattern. When
// `props.promise` changes, useDeferredValue returns the prior value for one
// render, then commits the new value on a microtask. The first render reads
// the cached fulfilled state of the old promise (no suspend) and can flag
// `isStale`; the deferred-commit render suspends on the new promise.
export function DeferredSwap(props) @{
  <>
    @try {
      const deferred = useDeferredValue(props.promise);
      const isStale = props.promise !== deferred;
      const value = use(deferred);
      <div class={isStale ? 'data stale' : 'data fresh'}>{value as string}</div>
    } @pending {
      <div class='fallback'>{'first load'}</div>
    }
  </>
}

// State inside the try body survives suspend/resume — the body re-runs but
// the hook's stored value persists across attempts (only commits on success
// would lose it; mid-render setters during a suspended attempt are queued).
export function StateInsideTry(props) @{
  <>
    @try {
      const value = use(props.promise);
      const [n, setN] = useState(0);
      <div>
        <span id='val'>{(value + ':' + n) as string}</span>
        <button id='inc' onClick={() => setN(n + 1)}>{'inc'}</button>
      </div>
    } @pending {
      <div class='fallback'>{'loading'}</div>
    }
  </>
}

// Effects under a suspended try body should NOT fire while pending. They fire
// when the body finally resolves (matches React's "no effects in WIP tree
// that didn't commit").
export function EffectAfterResolve(props) @{
  <>
    @try {
      const value = use(props.promise);
      useEffect((log) => { log.push('mounted:' + value); }, [props.log, value]);
      <div>{value as string}</div>
    } @pending {
      <div class='fallback'>{'pending'}</div>
    }
  </>
}

// Nested try — inner pending catches first; outer is unaffected.
export function NestedSuspense(props) @{
  <>
    @try {
      <>
        <div class='outer'>{'outer'}</div>
        @try {
          const v = use(props.promise);
          <div class='inner'>{v as string}</div>
        } @pending {
          <div class='inner-fallback'>{'inner-loading'}</div>
        }
      </>
    } @pending {
      <div class='outer-fallback'>{'outer-loading'}</div>
    }
  </>
}

// Rejection bubbles past pending to catch (separate channel).
export function RejectVsPending(props) @{
  <>
    @try {
      const v = use(props.promise);
      <div class='resolved'>{v as string}</div>
    } @pending {
      <div class='fallback'>{'p'}</div>
    } @catch (err) {
      <div class='caught'>{('rejected: ' + err.message) as string}</div>
    }
  </>
}

// Mirrors ReactUse-test.js: hooks ABOVE a suspending use() are reused on
// replay — useState's value comes from the committed scope, not re-initialized.
export function ReplayHookCache(props) @{
  <>
    @try {
      const [n, setN] = useState(0);
      const value = use(props.promise);
      <div>
        <span id='val'>{(value + ':' + n) as string}</span>
        <button id='inc' onClick={() => setN(n + 1)}>{'inc'}</button>
      </div>
    } @pending {
      <div class='fallback'>{'loading'}</div>
    }
  </>
}

// Mirrors ReactSuspenseWithNoopRenderer's "does not call lifecycles of a
// suspended component (hooks)". Effects for the suspended sibling never
// fire while pending; the resolved sibling and the fallback's own effect
// run as usual.
export function EffectsSkippedForSuspended(props) @{
  <ul>
    <li>
      <span class='a'>{'A'}</span>
    </li>
    @try {
      const v = use(props.promise);
      useEffect((log) => { log.push('B-mount'); }, [props.log, v]);
      <li>
        <span class='b'>{('B:' + v) as string}</span>
      </li>
    } @pending {
      useEffect((log) => { log.push('fallback-mount'); }, [props.log]);
      <li class='loading-li'>{'Loading...'}</li>
    }
    <li>
      <span class='c'>{'C'}</span>
    </li>
  </ul>
}

// Mirrors "load multiple nested Suspense boundaries": each layer resolves
// in sequence, the inner fallback is revealed only after the outer resolves.
export function NestedRevealOrder(props) @{
  <>
    @try {
      const a = use(props.a);
      <div>
        <span class='a-resolved'>{('A:' + a) as string}</span>
        @try {
          const b = use(props.b);
          <span class='b-resolved'>{('B:' + b) as string}</span>
        } @pending {
          <span class='b-loading'>{'B-loading'}</span>
        }
      </div>
    } @pending {
      <div class='a-loading'>{'A-loading'}</div>
    }
  </>
}

// Two SIBLING try blocks — both render in the same outer pass so their
// fetches kick off in parallel; both `.then` listeners are armed before
// either resolves. No waterfall: A doesn't have to resolve before B starts.
function LeafA(props) @{
  <>
    @try {
      const v = use(props.p);
      <li class='leaf-a'>{('A:' + v) as string}</li>
    } @pending {
      <li class='leaf-a-loading'>{'A-loading'}</li>
    }
  </>
}

function LeafB(props) @{
  <>
    @try {
      const v = use(props.p);
      <li class='leaf-b'>{('B:' + v) as string}</li>
    } @pending {
      <li class='leaf-b-loading'>{'B-loading'}</li>
    }
  </>
}

export function SiblingBoundaries(props) @{
  // The two fetches are EAGER — created when ParentRender ran, so both
  // promises are already in flight before either Leaf component mounts.
  <ul>
    <LeafA p={props.a} />
    <LeafB p={props.b} />
  </ul>
}

// Within a SINGLE try body, the React idiom for parallel fetches is to
// kick them off via useMemo BEFORE reading them via use(). Otherwise the
// first use() throws and the second fetch never starts → classic waterfall.
export function ParallelInOneBoundary(props) @{
  <>
    @try {
      // Start BOTH fetches in parallel via a useMemo that runs once per
      // (cacheKey) change. The use() calls just read the already-running
      // promises in sequence — no waterfall.
      const [pa, pb] = useMemo(() => [props.startA(), props.startB()], [props.cacheKey]);
      const a = use(pa);
      const b = use(pb);
      <div class='both'>{(a + '/' + b) as string}</div>
    } @pending {
      <div class='fallback'>{'loading'}</div>
    }
  </>
}

// Negative case: WITHOUT useMemo, the two fetches happen in sequence
// because the body is re-entered from scratch on each replay attempt.
// On render 1: startA() called, throws. startB() not called.
// On render 2 (after A resolves): startA() returns cached, startB() called.
// We expose call counters so the test can prove the waterfall happened.
export function WaterfallBody(props) @{
  <>
    @try {
      const a = use(props.startA());
      const b = use(props.startB());
      <div class='both'>{(a + '/' + b) as string}</div>
    } @pending {
      <div class='fallback'>{'loading'}</div>
    }
  </>
}
