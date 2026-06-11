// Audit Batch 4 — Refs, events, scoped <style> on SVG and MathML.
// Validates that SVG/MathML elements participate in the runtime contracts
// (refs, delegated events, foreignObject bubbling, scoped CSS hashing) the
// same way HTML elements do.

// ---------------------------------------------------------------------------
// Refs on SVG / MathML elements
// ---------------------------------------------------------------------------

// Object ref on an SVG <circle>. After mount, props.refSlot.current must be
// the SVGCircleElement (not null, not the parent <svg>).
export function SvgObjectRef(props) @{
  <svg>
    <circle ref={props.refSlot} class='target'/>
  </svg>
}

// Callback ref on an SVG <circle>. Fires with the element on mount and with
// null on unmount — matches React's ref-callback lifecycle.
export function SvgCallbackRef(props) @{
  <svg>
    <circle ref={(el) => props.observe(el)} class='target'/>
  </svg>
}

// Object ref on a MathML <mi>. Same contract as SVG — runtime must capture
// the element through the same ref binding path.
export function MathObjectRef(props) @{
  <math>
    <mi ref={props.refSlot}>{'x'}</mi>
  </math>
}

// ---------------------------------------------------------------------------
// Delegated events on SVG / inside <foreignObject>
// ---------------------------------------------------------------------------

// Inner <circle> stops propagation; outer <svg> handler must NOT fire when
// the inner one runs. Tests that the delegated dispatcher reaches SVG
// elements at all, and that stopPropagation works across the SVG tree.
export function SvgClickHandler(props) @{
  <svg class='outer' onClick={() => props.observe('outer')}>
    <circle id='c' class='inside' onClick={(e) => { e.stopPropagation(); props.observe('inner'); }}/>
  </svg>
}

// <foreignObject> hosts XHTML content. A click on the inner <button> must
// bubble through the XHTML <div> AND the SVG ancestor, hitting both handlers
// in document order (inner-first).
export function SvgInsideForeignObjectClick(props) @{
  <svg onClick={() => props.observe('svg')}>
    <foreignObject>
      <div onClick={() => props.observe('div')}>
        <button id='b'>{'click'}</button>
      </div>
    </foreignObject>
  </svg>
}

// ---------------------------------------------------------------------------
// Scoped <style> on SVG (inferno-next CSS-hashing pipeline)
// ---------------------------------------------------------------------------

// The component-local `<style>` block targets `.wrap circle`. The pipeline
// must add the hash class to BOTH the <svg class='wrap'> AND its descendant
// <circle> so the selector matches in the browser.
export function ScopedSvg() @{
  <>
    <svg class='wrap'>
      <circle cx='50' cy='50' r='20'/>
    </svg>
    <style>
      .wrap circle { fill: rgb(10, 20, 30); }
    </style>
  </>
}
