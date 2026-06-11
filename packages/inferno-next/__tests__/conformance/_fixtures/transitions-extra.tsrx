import { use, useState, useEffect, useTransition, startTransition, useDeferredValue } from 'inferno-next';

// ============================================================================
// Gap 16 (Transitions): transition that throws synchronously (no suspend)
// ============================================================================
// React's contract: a `start(fn)` whose fn throws an error during the resulting
// render commits the error to the nearest error boundary AND flips isPending
// back to false (the transition was settled — abnormally — so no leftover
// pending state). Mirrors React's "transition error handling" tests.

function MaybeThrow(props) @{
  if (props.bang) {
    throw new Error('transition-boom');
  }
  <span class='ok'>{('val:' + props.n) as string}</span>
}

export function TransitionThatThrows(props) @{
  const [n, setN] = useState(0);
  const [bang, setBang] = useState(false);
  const [isPending, start] = useTransition();
  <>
    @try {
      <div class='shell'>
        <span id='pending'>{(isPending ? '1' : '0') as string}</span>
        <span id='n'>{n as string}</span>
        <button id='do' onClick={() => start(() => { setBang(true); setN(n + 1); })}>{'transition'}</button>
        <MaybeThrow bang={bang} n={n} />
      </div>
    } @catch (err) {
      <div id='err'>{err.message as string}</div>
    }
  </>
}

// ============================================================================
// Gap 18 (Transitions): startTransition called from inside useEffect body
// ============================================================================
// Effect-scheduled state updates should still be tagged transition-priority
// when wrapped in startTransition. Verifies useEffect → startTransition →
// setter pipeline preserves the priority hint through to the next render.

export function StartTransitionInEffect(props) @{
  const [tick, setTick] = useState(0);
  const [v, setV] = useState('init');
  const [isPending] = useTransition();
  useEffect((tickP, setVRef) => {
    if (tickP > 0) {
      startTransition(() => setVRef('via-effect'));
    }
  }, [tick, setV]);
  <div>
    <span id='pending'>{(isPending ? '1' : '0') as string}</span>
    <span id='v'>{v as string}</span>
    <button id='tick' onClick={() => setTick(tick + 1)}>{'tick'}</button>
  </div>
}

// ============================================================================
// Gap 19 (Deferred): useDeferredValue identity stability
// ============================================================================
// React: re-rendering with the SAME input must return the SAME deferred
// value (Object.is). No allocation, no spurious re-renders downstream.

export function DeferredIdentity(props) @{
  const d = useDeferredValue(props.input);
  // Side-effect observer for the test to capture every committed deferred
  // value reference. The observer is invoked during render, so each render
  // logs ONE value — the test asserts identity by comparing across renders.
  props.observe(d);
  <span class='out' data-tag={d.tag}>{d.tag as string}</span>
}

// ============================================================================
// Gap 20 (Deferred + Suspense + Transition three-way)
// ============================================================================
// useDeferredValue + Suspense + a transition that swaps promise: under
// transition priority useDeferredValue defers in the SAME pass (no extra
// stale render), the suspending consumer keeps prior DOM, and isPending
// stays true until the new promise resolves.

export function DeferredSuspenseTransition(props) @{
  const [promise, setPromise] = useState(props.initialPromise);
  const [isPending, start] = useTransition();
  const deferred = useDeferredValue(promise);
  <div>
    <span id='pending'>{(isPending ? '1' : '0') as string}</span>
    <button id='swap' onClick={() => start(() => setPromise(props.nextPromise))}>{'swap'}</button>
    @try {
      const value = use(deferred);
      <span id='value'>{value as string}</span>
    } @pending {
      <span id='fallback'>{'fallback'}</span>
    }
  </div>
}

// ============================================================================
// Gap 15 (Transitions strengthening): record EVERY isPending value
// ============================================================================
// `TransitionBasics` only asserts isPending=false at end. The full contract
// is: rising edge on start(), falling edge after commit. Capture the full
// sequence to pin React's exact lifecycle.

export function PendingSequence(props) @{
  const [n, setN] = useState(0);
  const [isPending, start] = useTransition();
  props.observePending(isPending);                          // observer fires on every render
  <div>
    <button id='do' onClick={() => start(() => setN(n + 1))}>{'go'}</button>
    <span id='n'>{n as string}</span>
  </div>
}

// ============================================================================
// Gap 17 (Transitions strengthening): inner-only nested transition
// ============================================================================
// Outer useTransition's isPending must STAY FALSE when only the inner
// useTransition starts. The transition's pending-counter is per-hook.

export function NestedInnerOnly(props) @{
  const [n, setN] = useState(0);
  const [outerPending, outerStart] = useTransition();
  const [innerPending, innerStart] = useTransition();
  <div>
    <span id='outer'>{(outerPending ? '1' : '0') as string}</span>
    <span id='inner'>{(innerPending ? '1' : '0') as string}</span>
    <span id='n'>{n as string}</span>
    <button id='do-inner' onClick={() => innerStart(() => setN(props.target))}>{'inner-only'}</button>
    <button id='do-outer' onClick={() => outerStart(() => innerStart(() => setN(props.target)))}>{'both'}</button>
  </div>
}
