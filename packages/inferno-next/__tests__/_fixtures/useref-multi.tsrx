import { useRef, useEffect } from 'inferno-next';

// Separated out of useref.tsrx so the rest of that fixture compiles via
// @tsrx/react cleanly. @tsrx/react rejects two `ref={...}` attributes on
// the same element fixture-wide ("Element has multiple `ref={...}`
// attributes; an element may have at most one. Use a single array-valued
// ref such as `ref={[a, b]}` …"), which previously blocked every
// React-side differential mount for useref.tsrx — even for unrelated
// components.
//
// Inferno-next supports multiple `ref` attributes natively via mergeRefs
// in the codegen pipeline, so the test below exercises the inferno-side
// contract only. Differential coverage would require switching the
// fixture to the array-valued ref shape both runtimes agree on; track
// as a separate work item.
export function MultipleRefsOneEl(props) @{
  const a = useRef(null);
  const b = useRef(null);
  useEffect((tgt, ra, rb) => { tgt.a = ra.current; tgt.b = rb.current; },
    [props.target, a, b]);
  <div class='multi' ref={a} ref={b}>
    {'mounted'}
  </div>
}
