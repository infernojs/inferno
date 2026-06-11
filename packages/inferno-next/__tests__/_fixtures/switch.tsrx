import { useState } from 'inferno-next';

// Basic switch: select one of three string-typed cases by props.kind.
// `@default` is the fall-back when no `@case` matches.
export function PickKind(props) @{
  <div>
    @switch (props.kind) {
      @case 'a': {
        <span class='pick' data-kind='a'>{'A'}</span>
      }
      @case 'b': {
        <span class='pick' data-kind='b'>{'B'}</span>
      }
      @default: {
        <span class='pick' data-kind='other'>{'D'}</span>
      }
    }
  </div>
}

// Numeric discriminant + state-driven case switching. Lets a test click the
// button to advance, verifying the branch unmounts/remounts cleanly each time.
export function Cycle() @{
  const [n, setN] = useState(0);
  <div>
    <button id='bump' onClick={() => setN(n + 1)}>{n as string}</button>
    @switch (n % 3) {
      @case 0: {
        <span class='out' data-step='0'>{'zero'}</span>
      }
      @case 1: {
        <span class='out' data-step='1'>{'one'}</span>
      }
      @case 2: {
        <span class='out' data-step='2'>{'two'}</span>
      }
    }
  </div>
}

// No `@default`: when nothing matches the slot stays empty.
export function NoDefault(props) @{
  <div>
    <span class='before'>{'before'}</span>
    @switch (props.kind) {
      @case 'show': {
        <span class='maybe'>{'shown'}</span>
      }
    }
    <span class='after'>{'after'}</span>
  </div>
}

// Hooks inside a case body — branch-local state should reset when the
// selected case changes (block boundary semantics, mirrors @if).
export function HookInCase() @{
  const [outer, setOuter] = useState('x');
  <div>
    <button id='swap' onClick={() => setOuter(outer === 'x' ? 'y' : 'x')}>{outer as string}</button>
    @switch (outer) {
      @case 'x': {
        const [a, setA] = useState(0);
        <button id='inc-a' onClick={() => setA(a + 1)}>{('a:' + a) as string}</button>
      }
      @case 'y': {
        const [b, setB] = useState(0);
        <button id='inc-b' onClick={() => setB(b + 10)}>{('b:' + b) as string}</button>
      }
    }
  </div>
}
