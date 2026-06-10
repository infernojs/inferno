import { use, useState, useEffect, useMemo, useDeferredValue } from 'inferno-next';

// ---------------------------------------------------------------------------
// Basic Suspense flow — try/pending/catch with a use(promise) inside try.
// ---------------------------------------------------------------------------
export component BasicSuspense(props) {
  try {
    const value = use(props.promise);
    <div class='resolved'>{text value}</div>
  } pending {
    <div class='fallback'>{text 'loading'}</div>
  }
}

// `use` of a rejected promise rethrows the reason — caught by `catch`,
// independent from the `pending` arm.
export component CatchRejection(props) {
  try {
    const value = use(props.promise);
    <div class='resolved'>{text value}</div>
  } pending {
    <div class='fallback'>{text 'loading'}</div>
  } catch (err) {
    <div class='error'>{text 'caught: ' + err.message}</div>
  }
}

// Resetting from catch re-tries the try body — useful for retry buttons.
export component RetryFromCatch(props) {
  try {
    const value = use(props.promise);
    <div class='resolved'>{text value}</div>
  } pending {
    <div class='fallback'>{text 'loading'}</div>
  } catch (err, reset) {
    <button id='retry' onClick={reset}>{text 'retry: ' + err.message}</button>
  }
}

// Multiple use() calls — should all suspend and resolve in order. On replay,
// earlier resolved use() calls return synchronously from cache.
export component TwoUses(props) {
  try {
    const a = use(props.a);
    const b = use(props.b);
    <div class='both'>{text a + '/' + b}</div>
  } pending {
    <div class='fallback'>{text 'loading'}</div>
  }
}

// useDeferredValue + use() — the React-idiomatic stale-data pattern. When
// `props.promise` changes, useDeferredValue returns the prior value for one
// render, then commits the new value on a microtask. The first render reads
// the cached fulfilled state of the old promise (no suspend) and can flag
// `isStale`; the deferred-commit render suspends on the new promise.
export component DeferredSwap(props) {
  try {
    const deferred = useDeferredValue(props.promise);
    const isStale = props.promise !== deferred;
    const value = use(deferred);
    <div class={isStale ? 'data stale' : 'data fresh'}>{text value}</div>
  } pending {
    <div class='fallback'>{text 'first load'}</div>
  }
}

// State inside the try body survives suspend/resume — the body re-runs but
// the hook's stored value persists across attempts (only commits on success
// would lose it; mid-render setters during a suspended attempt are queued).
export component StateInsideTry(props) {
  try {
    const value = use(props.promise);
    const [n, setN] = useState(0);
    <div>
      <span id='val'>{text value + ':' + n}</span>
      <button id='inc' onClick={() => setN(n + 1)}>{text 'inc'}</button>
    </div>
  } pending {
    <div class='fallback'>{text 'loading'}</div>
  }
}

// Effects under a suspended try body should NOT fire while pending. They fire
// when the body finally resolves (matches React's "no effects in WIP tree
// that didn't commit").
export component EffectAfterResolve(props) {
  try {
    const value = use(props.promise);
    useEffect((log) => { log.push('mounted:' + value); }, [props.log, value]);
    <div>{text value}</div>
  } pending {
    <div class='fallback'>{text 'pending'}</div>
  }
}

// Nested try — inner pending catches first; outer is unaffected.
export component NestedSuspense(props) {
  try {
    <div class='outer'>{text 'outer'}</div>
    try {
      const v = use(props.promise);
      <div class='inner'>{text v}</div>
    } pending {
      <div class='inner-fallback'>{text 'inner-loading'}</div>
    }
  } pending {
    <div class='outer-fallback'>{text 'outer-loading'}</div>
  }
}

// Rejection bubbles past pending to catch (separate channel).
export component RejectVsPending(props) {
  try {
    const v = use(props.promise);
    <div class='resolved'>{text v}</div>
  } pending {
    <div class='fallback'>{text 'p'}</div>
  } catch (err) {
    <div class='caught'>{text 'rejected: ' + err.message}</div>
  }
}

// Mirrors ReactUse-test.js: hooks ABOVE a suspending use() are reused on
// replay — useState's value comes from the committed scope, not re-initialized.
export component ReplayHookCache(props) {
  try {
    const [n, setN] = useState(0);
    const value = use(props.promise);
    <div>
      <span id='val'>{text value + ':' + n}</span>
      <button id='inc' onClick={() => setN(n + 1)}>{text 'inc'}</button>
    </div>
  } pending {
    <div class='fallback'>{text 'loading'}</div>
  }
}

// Mirrors ReactSuspenseWithNoopRenderer's "does not call lifecycles of a
// suspended component (hooks)". Effects for the suspended sibling never
// fire while pending; the resolved sibling and the fallback's own effect
// run as usual.
export component EffectsSkippedForSuspended(props) {
  <ul>
    <li>
      <span class='a'>{text 'A'}</span>
    </li>
    try {
      const v = use(props.promise);
      <li>
        <span class='b'>{text 'B:' + v}</span>
      </li>
      useEffect((log) => { log.push('B-mount'); }, [props.log, v]);
    } pending {
      <li class='loading-li'>{text 'Loading...'}</li>
      useEffect((log) => { log.push('fallback-mount'); }, [props.log]);
    }
    <li>
      <span class='c'>{text 'C'}</span>
    </li>
  </ul>
}

// Mirrors "load multiple nested Suspense boundaries": each layer resolves
// in sequence, the inner fallback is revealed only after the outer resolves.
export component NestedRevealOrder(props) {
  try {
    const a = use(props.a);
    <div>
      <span class='a-resolved'>{text 'A:' + a}</span>
      try {
        const b = use(props.b);
        <span class='b-resolved'>{text 'B:' + b}</span>
      } pending {
        <span class='b-loading'>{text 'B-loading'}</span>
      }
    </div>
  } pending {
    <div class='a-loading'>{text 'A-loading'}</div>
  }
}

// Two SIBLING try blocks — both render in the same outer pass so their
// fetches kick off in parallel; both `.then` listeners are armed before
// either resolves. No waterfall: A doesn't have to resolve before B starts.
component LeafA(props) {
  try {
    const v = use(props.p);
    <li class='leaf-a'>{text 'A:' + v}</li>
  } pending {
    <li class='leaf-a-loading'>{text 'A-loading'}</li>
  }
}

component LeafB(props) {
  try {
    const v = use(props.p);
    <li class='leaf-b'>{text 'B:' + v}</li>
  } pending {
    <li class='leaf-b-loading'>{text 'B-loading'}</li>
  }
}

export component SiblingBoundaries(props) {
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
export component ParallelInOneBoundary(props) {
  try {
    // Start BOTH fetches in parallel via a useMemo that runs once per
    // (cacheKey) change. The use() calls just read the already-running
    // promises in sequence — no waterfall.
    const [pa, pb] = useMemo(() => [props.startA(), props.startB()], [props.cacheKey]);
    const a = use(pa);
    const b = use(pb);
    <div class='both'>{text a + '/' + b}</div>
  } pending {
    <div class='fallback'>{text 'loading'}</div>
  }
}

// Negative case: WITHOUT useMemo, the two fetches happen in sequence
// because the body is re-entered from scratch on each replay attempt.
// On render 1: startA() called, throws. startB() not called.
// On render 2 (after A resolves): startA() returns cached, startB() called.
// We expose call counters so the test can prove the waterfall happened.
export component WaterfallBody(props) {
  try {
    const a = use(props.startA());
    const b = use(props.startB());
    <div class='both'>{text a + '/' + b}</div>
  } pending {
    <div class='fallback'>{text 'loading'}</div>
  }
}
