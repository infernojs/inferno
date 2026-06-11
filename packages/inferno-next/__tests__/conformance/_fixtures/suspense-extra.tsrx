import { use, useState, useReducer, useMemo, useRef, useEffect, createContext } from 'inferno-next';

// ============================================================================
// Gap 2 (Suspense): `use()` accepts non-promise values
// ============================================================================
// React's `use()` is overloaded: a thenable → suspends; a Context → reads it
// synchronously; anything else → throws. Verifies (a) the Context path works
// from inside a @try body (where the same overload must apply), and (b) the
// invariant fires for unsupported usables.

export const ExtraCtx = createContext('default');

export function UseContextInTryBody() @{
  <>
    @try {
      const v = use(ExtraCtx);
      <span class='ctx-val'>{v as string}</span>
    } @pending {
      <span class='fallback'>{'loading'}</span>
    }
  </>
}

export function UseUnsupportedUsable(props) @{
  <>
    @try {
      // `use(props.x)` where `x` is neither thenable nor Context should throw.
      const v = use(props.x);
      <span class='resolved'>{v as string}</span>
    } @catch (err) {
      <span class='caught'>{err.message as string}</span>
    }
  </>
}

// ============================================================================
// Gap 4 (Suspense): synchronous render throw vs rejected promise
// ============================================================================
// React's contract: both end up at the same error boundary, with the same
// `err.message`. A user re-pointing `use(rejected)` to a sync `throw` should
// observe no visible difference.

function SyncThrowChild(props) @{
  if (props.bang) {
    throw new Error('boom');
  }
  <span class='ok'>{'ok'}</span>
}

export function SyncThrowBoundary(props) @{
  <>
    @try {
      <SyncThrowChild bang={props.bang} />
    } @catch (err) {
      <span class='caught'>{err.message as string}</span>
    }
  </>
}

function AsyncRejectChild(props) @{
  // Resolved/rejected via the parent's promise prop. `use()` of a rejected
  // promise throws `err` — identical surface as the sync-throw case above.
  const _v = use(props.promise);
  <span class='ok'>{_v as string}</span>
}

export function AsyncRejectBoundary(props) @{
  <>
    @try {
      <AsyncRejectChild promise={props.promise} />
    } @pending {
      <span class='fallback'>{'loading'}</span>
    } @catch (err) {
      <span class='caught'>{err.message as string}</span>
    }
  </>
}

// ============================================================================
// Gap 5 (Suspense): unmounting a suspended boundary mid-pending
// ============================================================================
// A parent re-render that wipes the suspended boundary out of the tree must
// also cancel any pending replay — when the promise eventually resolves there
// must be NO late commit / DOM mutation, AND no use-after-unmount errors.

function SuspendingLeaf(props) @{
  const v = use(props.promise);
  <span class='leaf'>{v as string}</span>
}

export function ToggleableSuspense(props) @{
  const [show, setShow] = useState(true);
  <>
    <button id='toggle' onClick={() => setShow(!show)}>{'toggle'}</button>
    @if (show) {
      @try {
        <SuspendingLeaf promise={props.promise} />
      } @pending {
        <span class='fallback'>{'pending'}</span>
      }
    }
  </>
}

// ============================================================================
// Gap 9 (Suspense): hooks above use() reused per hook type (strengthening)
// ============================================================================
// `ReplayHookCache` only covered useState. React reuses EVERY hook above a
// suspending use() on replay — useReducer / useMemo / useRef / useCallback
// /etc. all read their committed slot from the prior attempt.

export function HooksAboveReplay(props) @{
  <>
    @try {
      const ref = useRef({ count: 0 });
      ref.current.count++;                                  // observes replay count
      props.observeRef(ref);
      const [reduced, dispatch] = useReducer((s, a) => s + a, 0);
      const memoed = useMemo(() => ({ k: 'fixed' }), []);
      const v = use(props.promise);
      <div class='out'>
        <span id='ref-count'>{ref.current.count as string}</span>
        <span id='reduced'>{reduced as string}</span>
        <span id='memo-ident'>{(memoed === props.lastMemoed ? 'same' : 'fresh') as string}</span>
        <span id='value'>{v as string}</span>
        <button id='dispatch' onClick={() => dispatch(10)}>{'+10'}</button>
      </div>
    } @pending {
      <span class='fallback'>{'loading'}</span>
    }
  </>
}

// ============================================================================
// Gap 10 (Suspense): hooks below use() are NOT registered until use() resolves
// ============================================================================
// Suspended replay throws OUT of `use()`, so hooks declared below it never
// get a slot allocated. After resolve, the body runs to completion and the
// hooks fire normally — ONCE.

export function HooksBelowNoFire(props) @{
  <>
    @try {
      const v = use(props.promise);
      // Anything below the use() should not have fired while pending.
      useEffect((log) => { log.push('below-effect'); }, [props.log]);
      const r = useRef(0);
      r.current++;
      props.observeRef(r);
      <span class='below'>{v as string}</span>
    } @pending {
      <span class='fallback'>{'pending'}</span>
    }
  </>
}

// ============================================================================
// Gap 11 (Suspense): use() inside an @if branch
// ============================================================================
// `use()` is allowed inside conditional positions in React (one of its
// distinguishing features vs ordinary hooks). When a @if branch contains a
// `use()` that suspends, the surrounding @try catches the suspend; toggling
// the @if to the OTHER branch unmounts the suspended one cleanly.

export function UseInIf(props) @{
  <>
    @try {
      @if (props.which === 'a') {
        <span class='a'>{use(props.pA) as string}</span>
      } @else {
        <span class='b'>{use(props.pB) as string}</span>
      }
    } @pending {
      <span class='fallback'>{'pending'}</span>
    }
  </>
}

// ============================================================================
// Gap 12 (Suspense): same promise referenced by two use() calls in one boundary
// ============================================================================
// React's per-fiber thenable cache keys by the promise object. Calling
// `use(p)` twice with the same `p` only awaits once; the second call reads
// the cached value synchronously even within the same render.

export function SamePromiseTwice(props) @{
  <>
    @try {
      const a = use(props.promise);
      const b = use(props.promise);
      <div class='both'>
        <span id='a'>{a as string}</span>
        <span id='b'>{b as string}</span>
        <span id='same'>{(a === b ? 'same' : 'diff') as string}</span>
      </div>
    } @pending {
      <span class='fallback'>{'pending'}</span>
    }
  </>
}

// ============================================================================
// Gap 13 (Suspense): two sibling boundaries reading the SAME promise
// ============================================================================
// A single resolve must satisfy every boundary that's waiting on the
// promise. React commits both reveals in the SAME frame. Tests assert no
// inter-boundary lag.

function SharedLeaf(props) @{
  <span class={'shared shared-' + props.id}>{use(props.promise) as string}</span>
}

export function TwoBoundariesSharedPromise(props) @{
  <div>
    <>
      @try {
        <SharedLeaf id='a' promise={props.promise} />
      } @pending {
        <span class='fb fb-a'>{'wait-a'}</span>
      }
    </>
    <>
      @try {
        <SharedLeaf id='b' promise={props.promise} />
      } @pending {
        <span class='fb fb-b'>{'wait-b'}</span>
      }
    </>
  </div>
}
