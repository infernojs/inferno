import { createPortal } from 'inferno-next';

// `<tsrx>…</tsrx>` at expression position is gone. The new TSRX equivalent
// is an arrow returning a `@{ }` block — same semantics: the body is
// rendered wherever the consumer (e.g. createPortal) decides.

export function PortalledWithTsrx(props) @{
  const slot = () => @{ <div class='from-tsrx'>{props.label as string}</div> };
  <div class='host'>
    {createPortal(slot, props.target)}
  </div>
}

// Inline arrow returning a @{ } block — directly as createPortal's body argument.
export function InlineTsrx(props) @{
  <div class='host'>
    {createPortal(() => @{ <span class='inline'>{'inline'}</span> }, props.target)}
  </div>
}
