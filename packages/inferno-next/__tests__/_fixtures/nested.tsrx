import { useState, useEffect } from 'inferno-next';

// ── Nested hooks ────────────────────────────────────────────────────────────
// Each hook call site has its own compile-time Symbol slot, so hooks inside
// if/for/try bodies don't collide with sibling hooks or with the parent's.

// Hooks declared inside an if-branch — only "exist" when that branch is mounted.
export function HookInIf() @{
  const [show, setShow] = useState(true);
  <>
    <button id='top' onClick={() => setShow(!show)}>{'toggle'}</button>
    @if (show) {
      const [n, setN] = useState(0);
      <button id='inner' onClick={() => setN(n + 1)}>{n as string}</button>
    }
  </>
}

// Two if-branches each declaring their own state — independent slots.
export function HooksInIfElse() @{
  const [path, setPath] = useState('a');
  <>
    <button id='swap' onClick={() => setPath(path === 'a' ? 'b' : 'a')}>{'swap'}</button>
    @if (path === 'a') {
      const [na, setNa] = useState(0);
      <button id='a' onClick={() => setNa(na + 1)}>{('a:' + na) as string}</button>
    } @else {
      const [nb, setNb] = useState(0);
      <button id='b' onClick={() => setNb(nb + 1)}>{('b:' + nb) as string}</button>
    }
  </>
}

// Hooks inside each for-of item — each item has its own Block + scope.
// Per-row hook state must be independent across rows AND survive reorders by key.
function Row(props) @{
  const [n, setN] = useState(0);
  <li class={'row-' + props.id}>
    <button onClick={() => setN(n + 1)}>{(props.label + ':' + n) as string}</button>
  </li>
}

export function RowList() @{
  const [items, setItems] = useState([{id:1,label:'a'},{id:2,label:'b'},{id:3,label:'c'}]);
  <div>
    <button id='reverse' onClick={() => setItems([...items].reverse())}>{'rev'}</button>
    <ul>
      @for (const it of items; key it.id) {
        <Row id={it.id} label={it.label} />
      }
    </ul>
  </div>
}

// Hooks inside try-body — each branch boundary is its own slot owner.
function TryBoundaryWithHooks(props) @{
  <>
    @try {
      const [hit, setHit] = useState(0);
      if (props.bang) {
        throw new Error('boom');
      }
      <button id='hit' onClick={() => setHit(hit + 1)}>{('hit:' + hit) as string}</button>
    } @catch (err) {
      const [tries, setTries] = useState(0);
      <button id='retry' onClick={() => setTries(tries + 1)}>{('tries:' + tries) as string}</button>
    }
  </>
}

export function TryWithHooks() @{
  const [bang, setBang] = useState(false);
  <div>
    <button id='bang' onClick={() => setBang(!bang)}>{bang ? 'on' : 'off'}</button>
    <TryBoundaryWithHooks bang={bang} />
  </div>
}

// ── Nested declarations ─────────────────────────────────────────────────────
// `const x = ...` inside an if/for/try body — the binding must be in scope for
// the JSX that uses it.

export function DeclInIf(props) @{
  <>
    @if (props.flag) {
      const greeting = 'hello ' + props.name;
      <p class='msg'>{greeting as string}</p>
    } @else {
      const fallback = props.name + '?';
      <p class='msg'>{fallback as string}</p>
    }
  </>
}

export function DeclInForLoop(props) @{
  <ul>
    @for (const n of props.nums; key n) {
      const squared = n * n;
      const label = n + '² = ' + squared;
      <li>{label as string}</li>
    }
  </ul>
}

export function DeclInTry() @{
  <>
    @try {
      const computed = 'try-branch';
      throw new Error('always');
      <p class='out'>{computed as string}</p>
    } @catch (err) {
      const recovered = 'caught: ' + err.message;
      <p class='out'>{recovered as string}</p>
    }
  </>
}
