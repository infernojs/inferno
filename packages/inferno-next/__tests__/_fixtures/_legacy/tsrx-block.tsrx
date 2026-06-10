import { createPortal } from 'inferno-next';

// `<tsrx>...</tsrx>` at expression position compiles to a hoisted render fn.
// Here we bind one to a const and pass it as the `body` arg of createPortal.

export component PortalledWithTsrx(props) {
  const slot = <tsrx><div class='from-tsrx'>{text props.label}</div></tsrx>;
  <div class='host'>
    {createPortal(slot, props.target)}
  </div>
}

// Inline <tsrx>...</tsrx> directly as createPortal's body argument.
export component InlineTsrx(props) {
  <div class='host'>
    {createPortal(<tsrx><span class='inline'>{text 'inline'}</span></tsrx>, props.target)}
  </div>
}
