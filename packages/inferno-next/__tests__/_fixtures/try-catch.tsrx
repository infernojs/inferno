import { useState, useEffect } from 'inferno-next';

// Inner component that throws on render when `props.bang` is true.
function ThrowsOnRender(props) @{
  if (props.bang) {
    throw new Error('render boom');
  }
  <p class='ok'>{'rendered'}</p>
}

// Inner component that registers a useEffect that throws after mount.
function ThrowsInEffect(props) @{
  useEffect((trigger) => {
    if (trigger) throw new Error('effect boom');
  }, [props.bang]);
  <p class='ok'>{'ok-for-now'}</p>
}

// Boundary catches render errors. Reset button re-attempts the try body.
export function RenderBoundary(props) @{
  <>
    @try {
      <div class='ok-wrap'>
        <ThrowsOnRender bang={props.bang} />
      </div>
    } @catch (err, reset) {
      <div class='caught'>
        <span class='msg'>{err.message as string}</span>
        <button onClick={() => reset()}>{'retry'}</button>
      </div>
    }
  </>
}

// Boundary catches effect errors too.
export function EffectBoundary(props) @{
  <>
    @try {
      <div class='ok-wrap'>
        <ThrowsInEffect bang={props.bang} />
      </div>
    } @catch (err) {
      <div class='caught'>
        <span class='msg'>{err.message as string}</span>
      </div>
    }
  </>
}

// Nested boundaries — outer is fallback; inner handles its own subtree first.
function AlwaysThrows() @{
  throw new Error('always');
  <p>{'never'}</p>
}

export function Nested() @{
  <>
    @try {
      <div class='outer'>
        @try {
          <AlwaysThrows />
        } @catch (err) {
          <span class='inner-msg'>{('inner: ' + err.message) as string}</span>
        }
      </div>
    } @catch (err) {
      <span class='outer-msg'>{('outer: ' + err.message) as string}</span>
    }
  </>
}

// Boundary with state that should survive when the boundary stays in `try`.
export function StatefulInside() @{
  const [n, setN] = useState(0);
  <>
    @try {
      <div class='wrap'>
        <button id='inc' onClick={() => setN(n + 1)}>{n as string}</button>
      </div>
    } @catch (err) {
      <span class='caught'>{err.message as string}</span>
    }
  </>
}
