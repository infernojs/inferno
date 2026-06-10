import { useState, useRef, useEffect, useImperativeHandle } from 'inferno-next';

// Initial value only runs once — mutations persist across re-renders without
// re-triggering them.
export function PersistsAcrossRenders() @{
  const ref = useRef(0);
  const [tick, setTick] = useState(0);
  <div>
    <span class='value'>{ref.current as string}</span>
    <button id='bump' onClick={() => { ref.current++; setTick(tick + 1); }}>{'bump'}</button>
  </div>
}

// Mutating ref.current does NOT trigger a re-render on its own.
export function MutationDoesNotRerender(props) @{
  const ref = useRef(0);
  // Bump via a side-effect handler — re-render is controlled by props.tick only.
  props.bumpHandle.bump = () => { ref.current++; };
  props.bumpHandle.read = () => ref.current;
  <span class='count'>{props.tick as string}</span>
}

// Ref identity is stable across renders.
export function StableIdentity(props) @{
  const ref = useRef({ data: 'inner' });
  const [tick, setTick] = useState(0);
  props.observe(ref);
  <button onClick={() => setTick(tick + 1)}>{tick as string}</button>
}

// Ref inside an if-branch resets to its initial value when the branch unmounts/remounts.
export function RefInIf() @{
  const [show, setShow] = useState(true);
  <div>
    <button id='top' onClick={() => setShow(!show)}>{'toggle'}</button>
    @if (show) {
      const ref = useRef(0);
      const [_t, force] = useState(0);
      <button id='inner' onClick={() => { ref.current++; force(ref.current); }}>{ref.current as string}</button>
    }
  </div>
}

// Each for-of item has its own independent ref slot.
function RowWithRef(props) @{
  const counter = useRef(0);
  const [_t, force] = useState(0);
  <li class={'r-' + props.id}>
    <button onClick={() => { counter.current++; force(counter.current); }}>
      {(props.label + ':' + counter.current) as string}
    </button>
  </li>
}

export function PerRowRef() @{
  const [items, setItems] = useState([{id:1,label:'a'},{id:2,label:'b'},{id:3,label:'c'}]);
  <div>
    <button id='reverse' onClick={() => setItems([...items].reverse())}>{'rev'}</button>
    <ul>
      @for (const it of items; key it.id) {
        <RowWithRef id={it.id} label={it.label} />
      }
    </ul>
  </div>
}

// `ref={refObj}` attribute — object form attaches to the DOM node.
export function DomRefObject(props) @{
  const ref = useRef(null);
  useEffect((target, refSlot) => {
    target.received = refSlot.current;
  }, [props.target, ref]);
  <div class='target' id='unique-id' ref={ref}>
    {'mounted'}
  </div>
}

// `ref={(el) => …}` callback form invoked with the element.
export function DomRefCallback(props) @{
  <div class='callback-target' ref={(el) => { props.target.received = el; }}>
    {'mounted'}
  </div>
}

// Multiple `ref` attributes on one element — both attach to the same element.
// New TSRX merges via mergeRefs in the codegen pipeline.
export function MultipleRefsOneEl(props) @{
  const a = useRef(null);
  const b = useRef(null);
  useEffect((tgt, ra, rb) => { tgt.a = ra.current; tgt.b = rb.current; },
    [props.target, a, b]);
  <div class='multi' ref={a} ref={b}>
    {'mounted'}
  </div>
}

// Cleanup on unmount: a callback ref observes mount + unmount.
// Each invocation of the callback updates `lastEl`, which a render-prop
// snapshot test can observe (it sees mount → unmount → mount-again).
export function DomRefCleanup(props) @{
  const [show, setShow] = useState(true);
  <div>
    <button id='toggle' onClick={() => setShow(!show)}>{'toggle'}</button>
    @if (show) {
      <div class='target' ref={(el) => props.observe(el)}>
        {'live'}
      </div>
    }
  </div>
}

// Object ref cleanup — the ref's `.current` is set to null on unmount.
export function DomRefObjectCleanup(props) @{
  const [show, setShow] = useState(true);
  <div>
    <button id='toggle' onClick={() => setShow(!show)}>{'toggle'}</button>
    @if (show) {
      <div class='obj-target' ref={props.ref}>
        {'live'}
      </div>
    }
  </div>
}

// useImperativeHandle: child exposes an imperative API via a ref the parent owns.
// Use functional setters so external callers can accumulate across rapid calls
// without depending on a fresh render between them.
function Counter(props) @{
  const [n, setN] = useState(0);
  useImperativeHandle(props.api, () => ({
    bump: () => setN((c) => c + 1),
    reset: () => setN(0),
  }), [props.api]);
  <span class='counter'>{n as string}</span>
}

export function ImperativeOwner(props) @{
  <div>
    <Counter api={props.handle} />
  </div>
}

// Initial value persists across renders — even though `props.factory()` is
// evaluated each render (useRef is NOT lazy in React's API, only useState is),
// the ref keeps the FIRST value it received and ignores later inputs.
export function LazyInit(props) @{
  const ref = useRef(props.factory());
  const [tick, setTick] = useState(0);
  <button onClick={() => setTick(tick + 1)}>{('init-value:' + ref.current) as string}</button>
}
