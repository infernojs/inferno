import { useState, useEffect } from 'inferno-next';

// Inner component that throws on render when `props.bang` is true.
component ThrowsOnRender(props) {
  if (props.bang) {
    throw new Error('render boom');
  }
  <p class='ok'>{text 'rendered'}</p>
}

// Inner component that registers a useEffect that throws after mount.
component ThrowsInEffect(props) {
  useEffect((trigger) => {
    if (trigger) throw new Error('effect boom');
  }, [props.bang]);
  <p class='ok'>{text 'ok-for-now'}</p>
}

// Boundary catches render errors. Reset button re-attempts the try body.
export component RenderBoundary(props) {
  try {
    <div class='ok-wrap'>
      <ThrowsOnRender bang={props.bang} />
    </div>
  } catch (err, reset) {
    <div class='caught'>
      <span class='msg'>{text err.message}</span>
      <button onClick={() => reset()}>{text 'retry'}</button>
    </div>
  }
}

// Boundary catches effect errors too.
export component EffectBoundary(props) {
  try {
    <div class='ok-wrap'>
      <ThrowsInEffect bang={props.bang} />
    </div>
  } catch (err) {
    <div class='caught'>
      <span class='msg'>{text err.message}</span>
    </div>
  }
}

// Nested boundaries — outer is fallback; inner handles its own subtree first.
component AlwaysThrows() {
  throw new Error('always');
  <p>{text 'never'}</p>
}

export component Nested() {
  try {
    <div class='outer'>
      try {
        <AlwaysThrows />
      } catch (err) {
        <span class='inner-msg'>{text 'inner: ' + err.message}</span>
      }
    </div>
  } catch (err) {
    <span class='outer-msg'>{text 'outer: ' + err.message}</span>
  }
}

// Boundary with state that should survive when the boundary stays in `try`.
export component StatefulInside() {
  const [n, setN] = useState(0);
  try {
    <div class='wrap'>
      <button id='inc' onClick={() => setN(n + 1)}>{text n}</button>
    </div>
  } catch (err) {
    <span class='caught'>{text err.message}</span>
  }
}
