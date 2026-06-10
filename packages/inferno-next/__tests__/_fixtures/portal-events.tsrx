import { useState, createPortal } from 'inferno-next';

/**
 * Click handler INSIDE the portal contents — verifies the portal target gets
 * the delegated listener attached (registerDelegationTarget refcount path).
 */
export function BasicPortalClick(props) @{
  const [count, setCount] = useState(0);
  <div class='app-root'>
    <span class='count'>{count as string}</span>
    {createPortal(
      () => @{
        <div class='modal'>
          <button class='inside-btn' onClick={() => setCount(count + 1)}>{'inside'}</button>
        </div>
      },
      props.target,
    )}
  </div>
}

/**
 * Click handler ON the React PARENT (above the portal). Verifies events
 * bubble OUT of the portal via $$portalParent — clicking inside the modal
 * should fire BOTH the inner handler AND the outer one.
 */
export function CrossPortalBubble(props) @{
  const [innerCount, setInnerCount] = useState(0);
  const [outerCount, setOuterCount] = useState(0);
  // The onClick on the root div MUST fire when the inner button is clicked,
  // because the inner button is logically a descendant of this div even
  // though its DOM lives in props.target.
  <div class='app-root' onClick={() => setOuterCount(outerCount + 1)}>
    <span class='inner-count'>{innerCount as string}</span>
    <span class='outer-count'>{outerCount as string}</span>
    {createPortal(
      () => @{
        <div class='modal'>
          <button class='inside-btn' onClick={() => setInnerCount(innerCount + 1)}>{'inside'}</button>
        </div>
      },
      props.target,
    )}
  </div>
}

/**
 * Stops propagation on the inner handler — verifies the outer handler does
 * NOT fire when the inner one cancels bubbling.
 */
export function StopPropagation(props) @{
  const [innerCount, setInnerCount] = useState(0);
  const [outerCount, setOuterCount] = useState(0);
  const inner = (e) => { e.stopPropagation(); setInnerCount(innerCount + 1); };
  <div class='app-root' onClick={() => setOuterCount(outerCount + 1)}>
    <span class='inner-count'>{innerCount as string}</span>
    <span class='outer-count'>{outerCount as string}</span>
    {createPortal(
      () => @{
        <div class='modal'>
          <button class='inside-btn' onClick={inner}>{'inside'}</button>
        </div>
      },
      props.target,
    )}
  </div>
}

/**
 * Two portals into the SAME target — the refcount on registerDelegationTarget
 * means the target gets listeners attached once. Both portals' inner handlers
 * must fire when their respective buttons are clicked.
 */
export function TwoPortalsSameTarget(props) @{
  const [aCount, setACount] = useState(0);
  const [bCount, setBCount] = useState(0);
  <div class='app-root'>
    <span class='a-count'>{aCount as string}</span>
    <span class='b-count'>{bCount as string}</span>
    {createPortal(
      () => @{ <button class='btn-a' onClick={() => setACount(aCount + 1)}>{'A'}</button> },
      props.target,
    )}
    {createPortal(
      () => @{ <button class='btn-b' onClick={() => setBCount(bCount + 1)}>{'B'}</button> },
      props.target,
    )}
  </div>
}

// Wrap the portal in its own component so the if-block below can mount/unmount
// it without inlining createPortal at conditional position (the TSRX compiler
// only takes createPortal at JSX child position of an element).
function PortalledButton(props) @{
  <span class='portal-anchor'>
    {createPortal(
      () => @{ <button class='inside-btn'>{'inside'}</button> },
      props.target,
    )}
  </span>
}

/**
 * Portal that can be unmounted via toggling state — verifies that when the
 * portal goes away, the listener is detached (refcount → 0) and a click on
 * the portal target's lingering DOM doesn't try to dispatch into a torn-down
 * Block.
 */
export function TogglePortal(props) @{
  const [open, setOpen] = useState(true);
  <div class='app-root'>
    <button class='toggle' onClick={() => setOpen(!open)}>{'toggle'}</button>
    @if (open) {
      <PortalledButton target={props.target} />
    }
  </div>
}
