import { useEffect, useLayoutEffect, useInsertionEffect } from 'inferno-next';

// Three-phase ordering: insertion fires sync-before-layout-before-paint;
// passive fires after paint. Cleanups of each phase fire before that phase's
// new bodies (React's "all old cleanups before any new bodies" guarantee).
//
// Effect bodies receive their deps as positional args, so we order the deps
// as [tick, log] and accept them in the same order in each fn.
export function PhaseOrder(props) @{
  useEffect((tick, log) => {
    log.push('eff:body');
    return () => log.push('eff:cleanup');
  }, [props.tick, props.log]);
  useLayoutEffect((tick, log) => {
    log.push('lay:body');
    return () => log.push('lay:cleanup');
  }, [props.tick, props.log]);
  useInsertionEffect((tick, log) => {
    log.push('ins:body');
    return () => log.push('ins:cleanup');
  }, [props.tick, props.log]);
  <div>{'x'}</div>
}

// useLayoutEffect runs AFTER the DOM commit — it can read the committed DOM.
export function LayoutReadsDom(props) @{
  useLayoutEffect((onCommit) => {
    const w = document.querySelector('#measured');
    onCommit(w == null ? null : w.outerHTML);
  }, [props.onCommit]);
  <div id='measured' style={'width: 100px'}>{'A'}</div>
}

// Layout fires synchronously inside flushSync; passive does not.
export function PassiveDeferred(props) @{
  useLayoutEffect((tick, log) => { log.push('layout'); }, [props.tick, props.log]);
  useEffect((tick, log) => { log.push('passive'); }, [props.tick, props.log]);
  <span>{'z'}</span>
}

// Multiple useEffects within the SAME phase — used to verify that cleanups
// fire in REVERSE-mount order within a phase (React's per-fiber contract).
// Three useEffects A, B, C; their mount callbacks each log themselves, and
// their cleanups log "<name>:cleanup". On unmount React fires C:cleanup
// before B:cleanup before A:cleanup.
export function ManyPassiveEffects(props) @{
  useEffect((log) => { log.push('A:body'); return () => log.push('A:cleanup'); }, [props.log]);
  useEffect((log) => { log.push('B:body'); return () => log.push('B:cleanup'); }, [props.log]);
  useEffect((log) => { log.push('C:body'); return () => log.push('C:cleanup'); }, [props.log]);
  <span>{'multi'}</span>
}
