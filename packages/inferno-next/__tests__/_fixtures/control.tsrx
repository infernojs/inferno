import { useState, useId } from 'inferno-next';

export function Toggle() @{
  const [on, setOn] = useState(false);
  <div>
    <button onClick={() => setOn(!on)}>{on ? 'on' : 'off'}</button>
    <section>
      @if (on) {
        <p class='shown'>{'shown'}</p>
      } @else {
        <p class='hidden'>{'hidden'}</p>
      }
    </section>
  </div>
}

export function IfOnly() @{
  const [show, setShow] = useState(false);
  <div>
    <button onClick={() => setShow(!show)}>{'toggle'}</button>
    <section>
      @if (show) {
        <span class='maybe'>{'shown'}</span>
      }
    </section>
  </div>
}

export function HookInIf() @{
  // Hooks inside an `@if` branch — uses our compile-time Symbol slots, so
  // toggling the branch destroys + recreates state (Block boundary semantics).
  const [show, setShow] = useState(true);
  <div>
    <button id='top' onClick={() => setShow(!show)}>{'toggle'}</button>
    <section>
      @if (show) {
        const [n, setN] = useState(0);
        <button id='inner' onClick={() => setN(n + 1)}>{n as string}</button>
      }
    </section>
  </div>
}

export function IdInComponent() @{
  const id = useId();
  <label for={id}>{id}</label>
}
