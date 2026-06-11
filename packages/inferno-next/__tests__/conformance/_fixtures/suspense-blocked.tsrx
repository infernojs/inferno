import { use, useState, useMemo, useDeferredValue } from 'inferno-next';

// ============================================================================
// Gap 7 (Suspense): use() inside a useMemo body
// ============================================================================
// A suspending `use()` called from within a `useMemo` factory: the suspend
// propagates out of the memo, up through the body, and is caught by the
// enclosing @try. On resolve replay, the memo factory re-runs (its cache is
// keyed by deps, NOT by suspended state). React: ReactUse-test.js.
//
// We pin: (a) suspend during the memo factory routes to @pending; (b) after
// resolve the memo value is the resolved-promise value (not stale); (c) the
// memo deps semantics survive a re-render that doesn't change deps.

export function UseInsideMemo(props) @{
  <>
    @try {
      const v = useMemo(() => 'm:' + use(props.promise), [props.depKey]);
      <span class='resolved'>{v as string}</span>
    } @pending {
      <span class='fallback'>{'pending'}</span>
    }
  </>
}

// ============================================================================
// Gap 8 (Suspense): a throw inside @pending body bubbles to outer boundary
// ============================================================================
// If the fallback ITSELF throws, the error must propagate up to the next
// boundary above — NOT be silently swallowed. Mirrors React's "throws if
// fallback throws" contract.

function ThrowOnRender(props) @{
  if (props.bang) {
    throw new Error('fallback-boom');
  }
  <span class='fallback-ok'>{'fallback-ok'}</span>
}

export function PendingThrowBubblesUp(props) @{
  <>
    @try {
      @try {
        const v = use(props.promise);
        <span class='resolved'>{v as string}</span>
      } @pending {
        <ThrowOnRender bang={true} />
      }
    } @catch (err) {
      <span class='outer-caught'>{err.message as string}</span>
    }
  </>
}

// ============================================================================
// Gap 21 (Deferred): useDeferredValue(value, initialValue) — React 19
// ============================================================================
// First render returns initialValue and schedules a deferred re-render
// committing the real value. Useful for a "show stable initial UI while
// expensive value settles" pattern. Reference: ReactDeferredValue-test.js
// "useDeferredValue with initialValue".

export function DeferredWithInitial(props) @{
  const v = useDeferredValue(props.value, props.initialValue);
  props.observe(v);
  <span class='out' data-tag={v.tag}>{v.tag as string}</span>
}
