import { useState, useReducer, useEffect, useLayoutEffect, useInsertionEffect, useMemo, useCallback, useRef } from 'inferno-next';

// Lazy initial value
export function LazyInit() @{
  const [n, setN] = useState(() => 41 + 1);
  <span>{n as string}</span>
}

// Two independent useState slots
export function TwoStates() @{
  const [a, setA] = useState(1);
  const [b, setB] = useState(10);
  <div>
    <button id='a' onClick={() => setA(a + 1)}>{a as string}</button>
    <button id='b' onClick={() => setB(b + 2)}>{b as string}</button>
  </div>
}

// useReducer
export function Tally() @{
  const [n, dispatch] = useReducer((s, a) => s + a, 0);
  <button onClick={() => dispatch(5)}>{n as string}</button>
}

// useMemo — recompute only when deps change.
// useRef(N) returns { current: N } — the runtime wraps.
export function MemoTest(props) @{
  const computeCount = useRef(0);
  const doubled = useMemo((x) => { computeCount.current++; return x * 2; }, [props.n]);
  <div>
    <span class='val'>{doubled as string}</span>
    <span class='count'>{computeCount.current as string}</span>
  </div>
}

// useCallback — stable identity per deps
export function CbTest(props) @{
  const cb = useCallback(() => props.label, [props.label]);
  <span>{props.label as string}</span>
}

// useRef — survives across renders, mutations don't trigger re-render.
export function RefTest() @{
  const ref = useRef(0);
  const [tick, setTick] = useState(0);
  <button onClick={() => { ref.current++; setTick(tick + 1); }}>
    {ref.current as string}
  </button>
}

// useEffect — fires after commit; cleanup on unmount
export function EffectMount(props) @{
  useEffect((onMount, onUnmount) => {
    onMount();
    return () => { onUnmount(); };
  }, [props.onMount, props.onUnmount]);
  <div>{'mounted'}</div>
}

// useEffect with deps — re-fires when deps change
export function EffectDeps(props) @{
  useEffect((cb, dep) => { cb(dep); }, [props.cb, props.n]);
  <span>{props.n as string}</span>
}

// useLayoutEffect runs synchronously (before passive useEffect)
export function LayoutVsEffect(props) @{
  useEffect((order) => { order.push('e'); }, [props.order]);
  useLayoutEffect((order) => { order.push('l'); }, [props.order]);
  useInsertionEffect((order) => { order.push('i'); }, [props.order]);
  <div>{'x'}</div>
}
