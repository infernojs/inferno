import { useState } from 'inferno-next';

// Simple early-return: render nothing when condition holds.
// Old syntax: `if (props.hide) return;` before the JSX.
// New syntax: gate the JSX with `@if (!cond)`.
export function Maybe(props) @{
  <>
    @if (!props.hide) {
      <p class='shown'>{'shown'}</p>
    }
  </>
}

// Two early-returns in sequence. Each gates the remainder.
// Old syntax interleaved JSX with `if return`. New syntax nests gates so each
// successive JSX is reached only when no prior `stop*` was set.
export function Multi(props) @{
  <>
    <p class='hello'>{'hello'}</p>
    @if (!props.stopA) {
      <>
        <p class='world'>{'world'}</p>
        @if (!props.stopB) {
          <p class='done'>{'done'}</p>
        }
      </>
    }
  </>
}

// Early return with toggle state — re-renders should re-evaluate.
export function Toggleable() @{
  const [show, setShow] = useState(true);
  <>
    <button onClick={() => setShow(!show)}>{'toggle'}</button>
    @if (show) {
      <p class='content'>{'content'}</p>
    }
  </>
}

// Early-return inside a no-braces if (semantically same as Maybe).
export function NoBraces(props) @{
  <>
    @if (!props.hide) {
      <p class='visible'>{'visible'}</p>
    }
  </>
}
