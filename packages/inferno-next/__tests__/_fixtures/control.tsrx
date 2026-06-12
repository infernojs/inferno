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

// Regression pin for tsrx 0.1.29 commit 921fb9ce — fix(parser): control
// flow trailing text. Before the fix, `@if (…) {…} trail` swallowed the
// trailing text node into the control-flow body. The fixtures place
// `trailing!` / `tail` immediately after the closing `}` of an @if and
// an @for so any regression drops the text from the rendered output.
//
// WhitespaceInIf pins the as-string leak fix: a TSAsExpression inside an
// @if BlockStatement body would print verbatim into the compiled output
// (`'foo' as string;`), which rolldown rejects as TS in a .js module.
// The fixture loads at all → the compile.js stripTsOnlyWrappers pass
// works. The body renders nothing (an expression-statement at @if body
// position is not lifted into a JSX child by current normalize semantics
// — a separate parser-semantics ticket, tracked in d14ec84f).

export function IfTrailingText(props) @{
  <p>
    @if (props.show) { <span class='gated'>{'yes'}</span> } trailing!
  </p>
}

export function ForTrailingText(props) @{
  <p>
    @for (const x of props.items; key x) { <span class='row'>{x as string}</span> } tail
  </p>
}

export function WhitespaceInIf(props) @{
  <p>
    @if (props.show) {{'  spaced  ' as string}}
  </p>
}
