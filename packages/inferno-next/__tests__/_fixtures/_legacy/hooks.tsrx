import { useState, useReducer, useEffect, useLayoutEffect, useInsertionEffect, useMemo, useCallback, useRef } from 'inferno-next';

// Lazy initial value
export component LazyInit() {
  const [n, setN] = useState(() => 41 + 1);
  <span>{text n}</span>
}

// Two independent useState slots
export component TwoStates() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(10);
  <div>
    <button id='a' onClick={() => setA(a + 1)}>{text a}</button>
    <button id='b' onClick={() => setB(b + 2)}>{text b}</button>
  </div>
}

// useReducer
export component Tally() {
  const [n, dispatch] = useReducer((s, a) => s + a, 0);
  <button onClick={() => dispatch(5)}>{text n}</button>
}

// useMemo — recompute only when deps change.
// useRef(N) returns { current: N } — the runtime wraps.
export component MemoTest(props) {
  const computeCount = useRef(0);
  const doubled = useMemo((x) => { computeCount.current++; return x * 2; }, [props.n]);
  <div>
    <span class='val'>{text doubled}</span>
    <span class='count'>{text computeCount.current}</span>
  </div>
}

// useCallback — stable identity per deps
export component CbTest(props) {
  const cb = useCallback(() => props.label, [props.label]);
  <span>{text props.label}</span>
}

// useRef — survives across renders, mutations don't trigger re-render.
export component RefTest() {
  const ref = useRef(0);
  const [tick, setTick] = useState(0);
  <button onClick={() => { ref.current++; setTick(tick + 1); }}>
    {text ref.current}
  </button>
}

// useEffect — fires after commit; cleanup on unmount
export component EffectMount(props) {
  useEffect((onMount, onUnmount) => {
    onMount();
    return () => { onUnmount(); };
  }, [props.onMount, props.onUnmount]);
  <div>{text 'mounted'}</div>
}

// useEffect with deps — re-fires when deps change
export component EffectDeps(props) {
  useEffect((cb, dep) => { cb(dep); }, [props.cb, props.n]);
  <span>{text props.n}</span>
}

// useLayoutEffect runs synchronously (before passive useEffect)
export component LayoutVsEffect(props) {
  useEffect((order) => { order.push('e'); }, [props.order]);
  useLayoutEffect((order) => { order.push('l'); }, [props.order]);
  useInsertionEffect((order) => { order.push('i'); }, [props.order]);
  <div>{text 'x'}</div>
}
