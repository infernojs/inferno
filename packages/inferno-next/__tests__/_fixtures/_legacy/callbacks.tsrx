import { useState, useCallback, useEffect, useEffectEvent, useRef } from 'inferno-next';

// useCallback — same identity per deps; new identity when deps change.
// We expose the callback identity via a passed-in observer.
export component CallbackIdentity(props) {
  const [n, setN] = useState(0);
  const cb = useCallback((x) => x + 1, [props.depKey]);
  props.observe(cb);
  <button id='inc' onClick={() => setN(n + 1)}>{text n}</button>
}

// useEffectEvent — stable identity, always invokes the latest closure.
// Demonstrates the classic "effect that subscribes once but always uses the
// latest count" pattern without re-subscribing on every count change.
export component EffectEventSubscriber(props) {
  const [count, setCount] = useState(0);
  // The handler reads `count` at call-time, but its identity is stable.
  const onTick = useEffectEvent(() => {
    props.tickLog.push('count=' + count);
  });
  // Subscribe ONCE — deps are []. We don't want to re-subscribe on every count change.
  useEffect((tickLog) => {
    tickLog.push('subscribe');
    const cleanup = () => tickLog.push('unsubscribe');
    // Fire onTick immediately + on every external trigger from props.fire.
    props.fire.handler = onTick;
    return cleanup;
  }, [props.tickLog, props.fire]);

  <button id='inc' onClick={() => setCount(count + 1)}>{text count}</button>
}

// useEffectEvent identity check.
export component EffectEventIdentity(props) {
  const [n, setN] = useState(0);
  const ev = useEffectEvent(() => n);
  props.observe(ev);
  <button onClick={() => setN(n + 1)}>{text n}</button>
}
