import { useState, Dynamic } from 'inferno-next';

// Two leaf components the parent can swap between via Dynamic.
export function Red(props) @{
  <span class='leaf red'>{('red:' + (props.label || '')) as string}</span>
}

export function Blue(props) @{
  <span class='leaf blue'>{('blue:' + (props.label || '')) as string}</span>
}

// Dynamic in action — parent picks `is` from props.
export function Pick(props) @{
  <div>
    <Dynamic is={props.is} label={props.label} />
  </div>
}

// State-driven swap: clicking toggles the rendered component, all other
// props get forwarded via `...rest` inside Dynamic.
export function Toggle() @{
  const [which, setWhich] = useState('red');
  const Comp = which === 'red' ? Red : Blue;
  <div>
    <button id='swap' onClick={() => setWhich(which === 'red' ? 'blue' : 'red')}>{which as string}</button>
    <Dynamic is={Comp} label='ok' />
  </div>
}
