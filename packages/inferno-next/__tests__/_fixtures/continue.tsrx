import { useState } from 'inferno-next';

// New TSRX rejects `continue` inside `@for`. The old "skip this iteration"
// pattern is rewritten as `@if (gate)` around the JSX to emit.

// Single guard skips rendering for matching items.
export function FilterList(props) @{
  <ul>
    @for (const item of props.items; key item.id) {
      @if (!item.hidden) {
        <li>{item.label as string}</li>
      }
    }
  </ul>
}

// Multiple skip-points in sequence — each gates everything after it.
// Always emit the badge; A is gated on !skipA; B is gated on !skipA && !skipB.
export function MultiContinue(props) @{
  <ul>
    @for (const item of props.items; key item.id) {
      <>
        <span class={'badge id-' + item.id}>{('r' + item.id) as string}</span>
        @if (!item.skipA) {
          <>
            <span class='a'>{('A:' + item.label) as string}</span>
            @if (!item.skipB) {
              <span class='b'>{('B:' + item.label) as string}</span>
            }
          </>
        }
      </>
    }
  </ul>
}

// No-braces form — same as FilterList post-port.
export function NoBraces(props) @{
  <ul>
    @for (const item of props.items; key item.id) {
      @if (!item.hidden) {
        <li>{item.label as string}</li>
      }
    }
  </ul>
}

// Toggle items in/out via state — verifies items reappear when their guard flips.
export function Stateful() @{
  const [items, setItems] = useState([
    { id: 1, label: 'a', hidden: false },
    { id: 2, label: 'b', hidden: true },
    { id: 3, label: 'c', hidden: false },
  ]);
  <div>
    <button id='show2' onClick={() => setItems(items.map((x) => x.id === 2 ? { ...x, hidden: false } : x))}>{'show 2'}</button>
    <button id='hide1' onClick={() => setItems(items.map((x) => x.id === 1 ? { ...x, hidden: true } : x))}>{'hide 1'}</button>
    <ul>
      @for (const item of items; key item.id) {
        @if (!item.hidden) {
          <li class={'l-' + item.id}>{item.label as string}</li>
        }
      }
    </ul>
  </div>
}

// `return` from a component body still works as a guard, paired with @if.
export function ReturnInComponentContinueInLoop(props) @{
  <>
    @if (!props.hideAll) {
      <ul>
        @for (const item of props.items; key item.id) {
          @if (!item.skip) {
            <li>{item.label as string}</li>
          }
        }
      </ul>
    }
  </>
}
