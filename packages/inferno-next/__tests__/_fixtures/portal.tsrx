import { useState, createContext, use, createPortal } from 'inferno-next';

export const Theme = createContext('light');

export function PortalledChild() @{
  const theme = use(Theme);
  <span class='child'>{theme as string}</span>
}

// React-shape: createPortal(children, target) at JSX child position.
// The compiler recognises the literal call and lowers to a `portal()` runtime
// call with no descriptor allocation.
//
// The sub-template that used to be `<tsrx>…</tsrx>` is now an arrow whose
// body is a `@{}` block (an `ArrowFunctionExpression` with a `JSXCodeBlock`
// body). Same compile-time semantics: the body is rendered inside the portal
// target rather than at the call site.
export function Modal(props) @{
  <section class='modal-anchor'>
    {createPortal(() => @{ <div class='modal'><PortalledChild /></div> }, props.target)}
  </section>
}

export function App(props) @{
  const [open, setOpen] = useState(true);
  <div class='app-root'>
    <button onClick={() => setOpen(!open)}>{'toggle'}</button>
    <Theme.Provider value={'dark'}>
      @if (open) {
        <Modal target={props.target} />
      }
    </Theme.Provider>
  </div>
}
