import { use, useState, useTransition, startTransition, useDeferredValue } from 'inferno-next';

// ---------------------------------------------------------------------------
// useTransition basics — [isPending, start]. The setter returned from start
// runs `fn` synchronously; setters inside are tagged transition-priority.
// ---------------------------------------------------------------------------
export component TransitionBasics() {
  const [n, setN] = useState(0);
  const [isPending, start] = useTransition();
  <div>
    <span id='n'>{text n}</span>
    <span id='pending'>{text isPending ? 'pending' : 'idle'}</span>
    <button id='bump-urgent' onClick={() => setN(n + 1)}>{text 'urgent'}</button>
    <button id='bump-transition' onClick={() => start(() => setN(n + 10))}>{text 'transition'}</button>
  </div>
}

// ---------------------------------------------------------------------------
// Transition suspend keeps prior DOM mounted — the canonical React 18
// "show old screen while new loads" pattern.
// ---------------------------------------------------------------------------
export component TransitionKeepsDom(props) {
  const [promise, setPromise] = useState(props.initialPromise);
  const [isPending, start] = useTransition();
  <div>
    <span id='pending'>{text isPending ? 'pending' : 'idle'}</span>
    <button id='swap' onClick={() => start(() => setPromise(props.nextPromise))}>{text 'swap'}</button>
    try {
      const value = use(promise);
      <span id='value'>{text value}</span>
    } pending {
      <span id='fallback'>{text 'fallback'}</span>
    }
  </div>
}

// ---------------------------------------------------------------------------
// startTransition as a STANDALONE function (no hook) — same priority
// tagging applies. Useful outside component bodies (e.g. event handlers
// that don't already use useTransition).
// ---------------------------------------------------------------------------
export component StandaloneStartTransition(props) {
  const [promise, setPromise] = useState(props.initialPromise);
  <div>
    <button id='swap' onClick={() => startTransition(() => setPromise(props.nextPromise))}>{text 'swap'}</button>
    try {
      const value = use(promise);
      <span id='value'>{text value}</span>
    } pending {
      <span id='fallback'>{text 'fallback'}</span>
    }
  </div>
}

// ---------------------------------------------------------------------------
// useDeferredValue with suspense — the deferred re-render runs at transition
// priority, so a suspending consumer keeps the prior DOM (no fallback flash).
// First render shows the prior value with isStale=true; microtask later, the
// new value commits, suspends, and the OLD DOM stays put until resolution.
// ---------------------------------------------------------------------------
export component DeferredValueWithSuspense(props) {
  const deferred = useDeferredValue(props.promise);
  const isStale = props.promise !== deferred;
  <div>
    try {
      const value = use(deferred);
      <span id='value' class={isStale ? 'stale' : 'fresh'}>{text value}</span>
    } pending {
      <span id='fallback'>{text 'fallback'}</span>
    }
  </div>
}

// ---------------------------------------------------------------------------
// Urgent updates preempt: an urgent setter after a transition setter forces
// the next render to be urgent. If that render suspends, the fallback SHOULD
// show (no DOM preservation, because the user explicitly asked for urgent).
// ---------------------------------------------------------------------------
export component UrgentPreemptsTransition(props) {
  const [promise, setPromise] = useState(props.initialPromise);
  const [_, start] = useTransition();
  <div>
    <button id='swap-trans' onClick={() => start(() => setPromise(props.nextPromise))}>{text 'trans'}</button>
    <button id='swap-urgent' onClick={() => setPromise(props.nextPromise)}>{text 'urgent'}</button>
    try {
      const value = use(promise);
      <span id='value'>{text value}</span>
    } pending {
      <span id='fallback'>{text 'fallback'}</span>
    }
  </div>
}

// ---------------------------------------------------------------------------
// Two SIBLING try blocks each with their own promise, both swapped via a
// single startTransition. Both fetches must resolve before isPending=false
// — "entangled" transitions (React equivalent: ReactTransition-test.js:190).
// ---------------------------------------------------------------------------
component EntLeafA(props) {
  try {
    const v = use(props.p);
    <span class='ent-a'>{text 'A:' + v}</span>
  } pending {
    <span class='ent-a-load'>{text 'A-load'}</span>
  }
}

component EntLeafB(props) {
  try {
    const v = use(props.p);
    <span class='ent-b'>{text 'B:' + v}</span>
  } pending {
    <span class='ent-b-load'>{text 'B-load'}</span>
  }
}

export component EntangledTransitions(props) {
  const [pA, setPA] = useState(props.initialA);
  const [pB, setPB] = useState(props.initialB);
  const [isPending, start] = useTransition();
  <div>
    <span id='pending'>{text isPending ? '1' : '0'}</span>
    <button id='swap-both' onClick={() => start(() => { setPA(props.nextA); setPB(props.nextB); })}>{text 'swap'}</button>
    <EntLeafA p={pA} />
    <EntLeafB p={pB} />
  </div>
}

// ---------------------------------------------------------------------------
// Single try body with TWO sequential use() calls. The first resolves, the
// body replays, then the SECOND use() suspends. Under a transition, the
// retry must keep the prior DOM AND isPending stays true through both
// suspensions (React: ReactUse-test.js:1446 "does not get stuck in pending").
// ---------------------------------------------------------------------------
export component IsPendingThroughReplay(props) {
  const [step, setStep] = useState(0);
  const [isPending, start] = useTransition();
  <div>
    <span id='pending'>{text isPending ? '1' : '0'}</span>
    <button id='swap' onClick={() => start(() => setStep(1))}>{text 'swap'}</button>
    try {
      const a = use(step === 0 ? props.initialA : props.nextA);
      const b = use(step === 0 ? props.initialB : props.nextB);
      <span id='value'>{text a + '/' + b}</span>
    } pending {
      <span id='fallback'>{text 'fallback'}</span>
    }
  </div>
}

// ---------------------------------------------------------------------------
// Nested startTransition — two separate useTransition hooks. Both `isPending`
// flags must be true while the inner transition is in flight, AND both flip
// to false on commit (React: ReactTransition-test.js:923).
// ---------------------------------------------------------------------------
export component NestedTransitions(props) {
  const [n, setN] = useState(0);
  const [pendingA, startA] = useTransition();
  const [pendingB, startB] = useTransition();
  <div>
    <span id='pending-a'>{text 'A:' + (pendingA ? '1' : '0')}</span>
    <span id='pending-b'>{text 'B:' + (pendingB ? '1' : '0')}</span>
    <span id='n'>{text n}</span>
    <button id='nest' onClick={() => startA(() => startB(() => setN(props.target)))}>{text 'nest'}</button>
  </div>
}

// ---------------------------------------------------------------------------
// useDeferredValue inside a transition — should NOT defer. Both the input
// value and the deferred read commit in the same transition pass (React:
// ReactDeferredValue-test.js:108 "does not defer during a transition").
// ---------------------------------------------------------------------------
export component DeferredValueInTransition() {
  const [v, setV] = useState(1);
  const [_, start] = useTransition();
  const deferred = useDeferredValue(v);
  <div>
    <span id='original'>{text 'Original: ' + v}</span>
    <span id='deferred'>{text 'Deferred: ' + deferred}</span>
    <button id='bump' onClick={() => start(() => setV(v + 1))}>{text 'bump'}</button>
  </div>
}

// ---------------------------------------------------------------------------
// Urgent supersede: a transition suspends on promise B, then an urgent
// setter swaps to promise C (already-resolved). The transition should be
// DISCARDED — isPending flips false, C is shown, and when B eventually
// resolves nothing happens (no-op retry).
// React equivalent: ReactUse-test.js:1631 "updates while component is
// suspended should not be mistaken for render phase updates".
// ---------------------------------------------------------------------------
export component UrgentSupersedesTransition(props) {
  const [promise, setPromise] = useState(props.initialPromise);
  const [isPending, start] = useTransition();
  <div>
    <span id='pending'>{text isPending ? '1' : '0'}</span>
    <button id='swap-trans' onClick={() => start(() => setPromise(props.transitionPromise))}>{text 'trans'}</button>
    <button id='swap-urgent' onClick={() => setPromise(props.urgentPromise)}>{text 'urgent'}</button>
    try {
      const value = use(promise);
      <span id='value'>{text value}</span>
    } pending {
      <span id='fallback'>{text 'fallback'}</span>
    }
  </div>
}
