import { useState, createContext, use, createPortal } from 'inferno-next';

export const Theme = createContext('light');

export component PortalledChild() {
  const theme = use(Theme);
  <span class='child'>{text theme}</span>
}

// React-shape: createPortal(children, target) at JSX child position.
// The compiler recognises the literal call and lowers to a `portal()` runtime
// call with no descriptor allocation.
export component Modal(props) {
  <section class='modal-anchor'>
    {createPortal(<tsrx><div class='modal'><PortalledChild /></div></tsrx>, props.target)}
  </section>
}

export component App(props) {
  const [open, setOpen] = useState(true);
  <div class='app-root'>
    <button onClick={() => setOpen(!open)}>{text 'toggle'}</button>
    <Theme.Provider value={'dark'}>
      if (open) {
        <Modal target={props.target} />
      }
    </Theme.Provider>
  </div>
}
