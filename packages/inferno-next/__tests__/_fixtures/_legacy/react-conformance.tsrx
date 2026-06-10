import { useState, useEffect, useLayoutEffect } from 'inferno-next';

// ---------------------------------------------------------------------------
// 1. setter identity stable — the setter returned by useState is
//    referentially identical across re-renders. Required so it's safe to
//    pass into effect dependency arrays without re-firing.
//    Adapted from ReactHooksWithNoopRenderer-test.js:311.
// ---------------------------------------------------------------------------
export component SetterIdentity(props) {
  const [n, setN] = useState(0);
  props.observe(setN);
  <div>
    <button id='bump' onClick={() => setN(n + 1)}>{text n}</button>
  </div>
}

// ---------------------------------------------------------------------------
// 2. useEffect deps compared with Object.is — same deps skip cleanup+create;
//    any change fires destroy(prev) → create(next) in that order.
//    Adapted from ReactHooksWithNoopRenderer-test.js:1800.
// ---------------------------------------------------------------------------
export component EffectDepsObjectIs(props) {
  useEffect((log, label, count) => {
    log.push('create ' + label + count);
    return () => log.push('destroy ' + label + count);
  }, [props.log, props.label, props.count]);
  <div>{text props.label + ':' + props.count}</div>
}

// ---------------------------------------------------------------------------
// 3. All previous cleanups fire BEFORE any new creates (multi-hook).
//    Adapted from ReactHooksWithNoopRenderer-test.js:1885.
// ---------------------------------------------------------------------------
export component AllDestroysBeforeCreates(props) {
  useEffect((log, count) => {
    log.push('Mount A ' + count);
    return () => log.push('Unmount A ' + count);
  }, [props.log, props.count]);
  useEffect((log, count) => {
    log.push('Mount B ' + count);
    return () => log.push('Unmount B ' + count);
  }, [props.log, props.count]);
  <div>{text props.count}</div>
}

// ---------------------------------------------------------------------------
// 4. Sibling cleanup ordering — across SIBLING components in the same commit,
//    all destroys run before any creates (globally).
//    Adapted from ReactHooksWithNoopRenderer-test.js:1926.
// ---------------------------------------------------------------------------
component SibLeaf(props) {
  useEffect((log, label, count) => {
    log.push('Mount ' + label + count);
    return () => log.push('Unmount ' + label + count);
  }, [props.log, props.label, props.count]);
  <span class={'leaf-' + props.label}>{text props.label + props.count}</span>
}

export component SiblingCleanupOrder(props) {
  <div>
    <SibLeaf log={props.log} label='A' count={props.count} />
    <SibLeaf log={props.log} label='B' count={props.count} />
  </div>
}

// ---------------------------------------------------------------------------
// 5. useLayoutEffect fires BEFORE useEffect in the same commit; both fire
//    AFTER the DOM has been mutated, so they can observe committed state.
//    Adapted from ReactHooksWithNoopRenderer-test.js:3092 + 3124.
// ---------------------------------------------------------------------------
export component LayoutVsPassive(props) {
  useLayoutEffect((log, count) => {
    // Synchronously observable: the <span> already shows `count`.
    const el = document.querySelector('#layout-target');
    log.push('layout ' + (el ? el.textContent : '<missing>') + ' (' + count + ')');
    return () => log.push('cleanup layout ' + count);
  }, [props.log, props.count]);
  useEffect((log, count) => {
    const el = document.querySelector('#layout-target');
    log.push('passive ' + (el ? el.textContent : '<missing>') + ' (' + count + ')');
    return () => log.push('cleanup passive ' + count);
  }, [props.log, props.count]);
  <span id='layout-target'>{text props.count}</span>
}
