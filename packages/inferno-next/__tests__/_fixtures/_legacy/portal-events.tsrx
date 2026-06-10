import { useState, createPortal } from 'inferno-next';

/**
 * Click handler INSIDE the portal contents — verifies the portal target gets
 * the delegated listener attached (registerDelegationTarget refcount path).
 */
export component BasicPortalClick(props) {
  const [count, setCount] = useState(0);
  <div class='app-root'>
    <span class='count'>{text count}</span>
    {createPortal(
      <tsrx>
        <div class='modal'>
          <button class='inside-btn' onClick={() => setCount(count + 1)}>{text 'inside'}</button>
        </div>
      </tsrx>,
      props.target,
    )}
  </div>
}

/**
 * Click handler ON the React PARENT (above the portal). Verifies events
 * bubble OUT of the portal via $$portalParent — clicking inside the modal
 * should fire BOTH the inner handler AND the outer one.
 */
export component CrossPortalBubble(props) {
  const [innerCount, setInnerCount] = useState(0);
  const [outerCount, setOuterCount] = useState(0);
  // The onClick on the root div MUST fire when the inner button is clicked,
  // because the inner button is logically a descendant of this div even
  // though its DOM lives in props.target.
  <div class='app-root' onClick={() => setOuterCount(outerCount + 1)}>
    <span class='inner-count'>{text innerCount}</span>
    <span class='outer-count'>{text outerCount}</span>
    {createPortal(
      <tsrx>
        <div class='modal'>
          <button class='inside-btn' onClick={() => setInnerCount(innerCount + 1)}>{text 'inside'}</button>
        </div>
      </tsrx>,
      props.target,
    )}
  </div>
}

/**
 * Stops propagation on the inner handler — verifies the outer handler does
 * NOT fire when the inner one cancels bubbling.
 */
export component StopPropagation(props) {
  const [innerCount, setInnerCount] = useState(0);
  const [outerCount, setOuterCount] = useState(0);
  const inner = (e) => { e.stopPropagation(); setInnerCount(innerCount + 1); };
  <div class='app-root' onClick={() => setOuterCount(outerCount + 1)}>
    <span class='inner-count'>{text innerCount}</span>
    <span class='outer-count'>{text outerCount}</span>
    {createPortal(
      <tsrx>
        <div class='modal'>
          <button class='inside-btn' onClick={inner}>{text 'inside'}</button>
        </div>
      </tsrx>,
      props.target,
    )}
  </div>
}

/**
 * Two portals into the SAME target — the refcount on registerDelegationTarget
 * means the target gets listeners attached once. Both portals' inner handlers
 * must fire when their respective buttons are clicked.
 */
export component TwoPortalsSameTarget(props) {
  const [aCount, setACount] = useState(0);
  const [bCount, setBCount] = useState(0);
  <div class='app-root'>
    <span class='a-count'>{text aCount}</span>
    <span class='b-count'>{text bCount}</span>
    {createPortal(
      <tsrx><button class='btn-a' onClick={() => setACount(aCount + 1)}>{text 'A'}</button></tsrx>,
      props.target,
    )}
    {createPortal(
      <tsrx><button class='btn-b' onClick={() => setBCount(bCount + 1)}>{text 'B'}</button></tsrx>,
      props.target,
    )}
  </div>
}

// Wrap the portal in its own component so the if-block below can mount/unmount
// it without inlining createPortal at conditional position (the TSRX compiler
// only takes createPortal at JSX child position of an element).
component PortalledButton(props) {
  <span class='portal-anchor'>
    {createPortal(
      <tsrx><button class='inside-btn'>{text 'inside'}</button></tsrx>,
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
export component TogglePortal(props) {
  const [open, setOpen] = useState(true);
  <div class='app-root'>
    <button class='toggle' onClick={() => setOpen(!open)}>{text 'toggle'}</button>
    if (open) {
      <PortalledButton target={props.target} />
    }
  </div>
}
