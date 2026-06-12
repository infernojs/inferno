import { useState } from 'inferno-next';

// Source-order regression fixtures for the four control-flow block types
// (@for, @if, @switch, @try). Each fixture places a block before AND/OR
// after a static-element sibling — pre-anchor-fix, inferno-next appended the
// block's start/end Comment markers to the parent host AFTER the static
// template content, flipping the visible DOM order. Differential tests in
// __tests__/differential/anchor-order.test.ts diff every variant against
// the same source compiled through @tsrx/react.

// ---------------------------------------------------------------------------
// forBlock
// ---------------------------------------------------------------------------

export function forBeforeSibling(props) @{
  <div class='wrap'>
    @for (const item of props.items; key item.id) {
      <p class='row'>{item.label as string}</p>
    }
    <span class='after'>{'after'}</span>
  </div>
}

export function forBetweenSiblings() @{
  const [items, setItems] = useState([
    { id: 1, label: 'a' },
    { id: 2, label: 'b' },
  ]);
  <div class='wrap'>
    <header class='hdr'>{'head'}</header>
    <button id='prepend' onClick={() => setItems([{ id: items.length + 10, label: 'z' }, ...items])}>{'prepend'}</button>
    <button id='append' onClick={() => setItems([...items, { id: items.length + 1, label: String.fromCharCode(97 + items.length) }])}>{'append'}</button>
    <button id='clear' onClick={() => setItems([])}>{'clear'}</button>
    <section class='list'>
      @for (const item of items; key item.id) {
        <p class='row'>{item.label as string}</p>
      }
      <footer class='ftr'>{'tail'}</footer>
    </section>
  </div>
}

// ---------------------------------------------------------------------------
// ifBlock
// ---------------------------------------------------------------------------

export function ifBeforeSibling(props) @{
  <div class='wrap'>
    @if (props.show) {
      <p class='gated'>{'gated-then'}</p>
    } @else {
      <p class='gated'>{'gated-else'}</p>
    }
    <span class='after'>{'after'}</span>
  </div>
}

export function ifBeforeSiblingToggle() @{
  const [show, setShow] = useState(true);
  <div class='wrap'>
    <button id='toggle' onClick={() => setShow(!show)}>{'toggle'}</button>
    @if (show) {
      <p class='gated'>{'gated-then'}</p>
    } @else {
      <p class='gated'>{'gated-else'}</p>
    }
    <span class='after'>{'after'}</span>
  </div>
}

// ---------------------------------------------------------------------------
// switchBlock
// ---------------------------------------------------------------------------

export function switchBeforeSibling(props) @{
  <div>
    <span class='before' data-pos='lead'>{'lead'}</span>
    @switch (props.kind) {
      @case 'a': {
        <span class='hit' data-kind='a'>{'A-body'}</span>
      }
      @case 'b': {
        <span class='hit' data-kind='b'>{'B-body'}</span>
      }
      @default: {
        <span class='hit' data-kind='other'>{'D-body'}</span>
      }
    }
    <span class='after' data-pos='mid'>{'mid'}</span>
    <span class='after' data-pos='tail'>{'tail'}</span>
  </div>
}

export function switchFirstChild(props) @{
  <div>
    @switch (props.kind) {
      @case 'a': {
        <span class='hit' data-kind='a'>{'A'}</span>
      }
      @default: {
        <span class='hit' data-kind='other'>{'D'}</span>
      }
    }
    <span class='after' data-pos='1'>{'one'}</span>
    <span class='after' data-pos='2'>{'two'}</span>
  </div>
}

export function switchCycle() @{
  const [n, setN] = useState(0);
  <div>
    <span class='before'>{'BEFORE'}</span>
    @switch (n % 3) {
      @case 0: {
        <span class='hit' data-step='0'>{'zero'}</span>
      }
      @case 1: {
        <span class='hit' data-step='1'>{'one'}</span>
      }
      @case 2: {
        <span class='hit' data-step='2'>{'two'}</span>
      }
    }
    <button id='bump' onClick={() => setN(n + 1)}>{'bump'}</button>
    <span class='after'>{'AFTER'}</span>
  </div>
}

// ---------------------------------------------------------------------------
// tryBlock
// ---------------------------------------------------------------------------

// The throw lives in a child component so it happens DURING render, after the
// parent's @try has set up its boundary. An eager IIFE in the parent's JSX
// body would throw during prop evaluation and propagate past the boundary on
// both sides (React's <ErrorBoundary> + TsrxErrorBoundary follow the same
// "descendant-render-only" contract) — so the differential test relies on
// the child-component pattern below.
// Pure fragment body — exercises the multi-root text-binding path. The
// compiler's text-binding mount now does the createTextNode swap on `_root`
// (the cloned fragment) instead of `__block.parentNode`, so the slot
// doesn't accidentally delete a pre-existing sibling in the live parent.
function Thrower(props) @{
  <>{(() => { if (props.throwIt) throw new Error('kaboom'); return ''; })() as string}</>
}

export function tryBeforeSibling(props) @{
  const [throwIt, setThrowIt] = useState(props.initialThrow ?? false);
  <div class='outer'>
    @try {
      <div class='try-body'>
        <span class='label'>{'before-throw'}</span>
        <Thrower throwIt={throwIt} />
        <span class='value'>{'ok'}</span>
      </div>
    } @catch (err, reset) {
      <div class='caught'>
        <span class='msg'>{err.message as string}</span>
        <button id='reset' onClick={() => { reset(); setThrowIt(false); }}>{'reset'}</button>
      </div>
    }
    <span class='after'>{'after-sibling'}</span>
    <button id='toggle' onClick={() => setThrowIt(!throwIt)}>{'toggle'}</button>
  </div>
}
