import { createPortal } from 'inferno-next';

function ProbeIf(props) @{
  <div>
    @if (props.on) {
      <span class='yes'>{'y'}</span>
    } @else {
      <span class='no'>{'n'}</span>
    }
  </div>
}

function ProbeFor(props) @{
  <ul>
    @for (const row of props.items; index i; key row.id) {
      <li class={'r-' + i}>{row.label}</li>
    }
  </ul>
}

function ProbeTry(props) @{
  <>
    @try {
      <Child a={props.a} />
    } @catch {
      <span class='err'>{'boom'}</span>
    } @pending {
      <span>{'loading'}</span>
    }
  </>
}


function ProbeRef(props) @{
  <input ref={props.r} innerHTML={props.h} />
}

function ProbeStyle() @{
  <div class='wrap'>
    {'styled'}
    <style>
      .wrap { color: red; }
    </style>
  </div>
}

function ProbePortal(props) @{
  <div>
    {createPortal(<span>{'modal'}</span>, props.target)}
  </div>
}

const PROBE_DYNAMIC = (Comp, props) => @{
  <Comp {...props} />
}

function ProbeSwitch(props) @{
  @switch (props.k) {
    @case 1: {
      <p>{'one'}</p>
    }
    @case 2: {
      <p>{'two'}</p>
    }
    @default: {
      <p>{'other'}</p>
    }
  }
}
