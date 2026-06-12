import { useRef, useEffect } from 'inferno-next';

// Array-valued ref form: `ref={[a, b]}` attaches BOTH refs to the same
// element. Matches React's canonical convention (the `react-merge-refs`
// pattern lifted into the runtime). attachRef in src/runtime.ts iterates
// the array and applies each shape (function / object) independently.
//
// Kept in its own file because it depends on the inferno-next positional-
// deps useEffect convention (the effect body reads the target via
// closure-captured `a`/`b` refs but receives `target` as a positional
// arg from the deps). That same convention blocks differential testing
// against React (separate work item), so the array-ref shape is exercised
// only by the non-differential useref.test.ts suite.
export function ArrayRefsOneEl(props) @{
  const a = useRef(null);
  const b = useRef(null);
  useEffect((tgt) => { tgt.a = a.current; tgt.b = b.current; }, [props.target]);
  <div class='multi' ref={[a, b]}>
    {'mounted'}
  </div>
}
