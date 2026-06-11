import { use, useState, useTransition } from 'inferno-next';

// ============================================================================
// Suspense Gap #6: transition-timeout fallback
// ============================================================================
// React's `useTransition` contract: when a transition-priority render
// suspends on an already-committed try block, the prior DOM stays mounted
// (no fallback flash) — BUT only up to a configurable budget. After the
// timeout fires React commits the @pending body so the user gets visual
// feedback instead of staring at stale content indefinitely. isPending
// stays true through the fallback window because the transition is still
// in progress; on resolve, the saved try-body DOM is reattached.
//
// Mirrors ReactSuspenseWithNoopRenderer-test.js "eventually shows fallback
// if transition takes too long".

function SuspendingLeaf(props) @{
  const v = use(props.promise);
  <span class='leaf'>{v as string}</span>
}

export function TimeoutFallback(props) @{
  const [promise, setPromise] = useState(props.initialPromise);
  const [isPending, start] = useTransition();
  <div>
    <span id='pending'>{(isPending ? '1' : '0') as string}</span>
    <button id='swap' onClick={() => start(() => setPromise(props.nextPromise))}>{'swap'}</button>
    @try {
      <SuspendingLeaf promise={promise} />
    } @pending {
      <span id='fallback'>{'pending-shown'}</span>
    }
  </div>
}
