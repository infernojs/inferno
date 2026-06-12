import { useState } from 'inferno-next';

// `<{expr}>` — @tsrx/core 0.1.29's new dynamic-tag syntax. Lets a parent
// pick the rendered component without the `<Dynamic is={...}>` runtime
// helper. Parser emits a JSXExpressionContainer at openingElement.name
// with `isDynamic === true`; the compiler routes through the same
// componentSlot path as `<Foo>` / `<ctx.Provider>`, with the inner
// expression interpolated verbatim as the component reference.

export function Red(props) @{
  <span class='leaf red'>{('red:' + (props.label || '')) as string}</span>
}

export function Blue(props) @{
  <span class='leaf blue'>{('blue:' + (props.label || '')) as string}</span>
}

// Direct prop drive — parent picks the component to render.
export function PickTag(props) @{
  <div>
    <{props.comp} label={props.label} />
  </div>
}

// State-driven swap to exercise the slot's re-mount path. Same shape as
// the existing `Toggle` fixture but using `<{Comp}>` instead of
// `<Dynamic is={Comp}/>`.
export function ToggleTag() @{
  const [which, setWhich] = useState('red');
  const Comp = which === 'red' ? Red : Blue;
  <div>
    <button id='swap' onClick={() => setWhich(which === 'red' ? 'blue' : 'red')}>{which as string}</button>
    <{Comp} label='ok' />
  </div>
}

// Member-expression component reference inside `<{expr}>` — works because
// the parser emits the whole inner expression node verbatim. Parent
// passes a namespace-like object whose member identifies the leaf.
export function PickMember(props) @{
  <div>
    <{props.lib.Red} label='member' />
  </div>
}
