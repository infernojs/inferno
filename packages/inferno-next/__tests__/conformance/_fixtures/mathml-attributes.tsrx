import { useState } from 'inferno-next';

// ============================================================================
// MathML attribute breadth + namespace inheritance (Audit Batch 2 — MathML)
// ============================================================================
// These fixtures pin Inferno-next's runtime attribute handling on MathML hosts.
// Each fixture exposes a single dynamic surface driven by props so the test
// can exercise both the create (initial mount) and the update (re-render with
// changed props) paths via mount() + update(). Mirrors the SVG Batch 2 shape
// (svg-attributes.tsrx) so the two suites stay structurally identical.

// ---------------------------------------------------------------------------
// Static-template MathML attributes — multiple attrs declared as string
// literals on a static template node. The HTML5 parser foreign-content rules
// place the elements in the MathML namespace; the attribute names should be
// preserved verbatim (no auto-lowercasing past what authoring already chose,
// no auto-camelCasing). Covers `display`, `displaystyle`, `accent`,
// `accentunder`, `mathcolor`, `scriptlevel`, `fontstyle`.
// ---------------------------------------------------------------------------
export function MathStaticAttrs(props) @{
  <math id='m-static' display='block' displaystyle='true' mathcolor='red'>
    <mrow id='m-row' scriptlevel='0' fontstyle='italic'>
      <mo id='m-op' accent='true' accentunder='false'>{'+'}</mo>
      <mi id='m-id' mathvariant='bold'>{'x'}</mi>
    </mrow>
  </math>
}

// ---------------------------------------------------------------------------
// Dynamic MathML attributes — every attribute value driven by props so both
// create and update paths route through the runtime setAttribute helper.
// Covers `mathvariant` (mi), `displaystyle` + `display` (math),
// `linethickness` (mfrac), `accent` (mo).
// ---------------------------------------------------------------------------
export function MathDynamicAttrs(props) @{
  <math id='m-dyn' display={props.display} displaystyle={props.displaystyle}>
    <mfrac id='m-frac' linethickness={props.linethickness}>
      <mi id='m-num' mathvariant={props.mathvariant}>{'a'}</mi>
      <mi id='m-den'>{'b'}</mi>
    </mfrac>
    <mo id='m-acc' accent={props.accent}>{'^'}</mo>
  </math>
}

// ---------------------------------------------------------------------------
// MathML attributes delivered via SPREAD — the compiler lowers `{...obj}` to
// `setSpread(el, value, prev)`, which calls the shared `setAttribute` helper
// per key. For MathML these are plain attributes (no namespace), so a spread
// of `mathvariant` should land as a regular attribute on the host element.
// ---------------------------------------------------------------------------
export function MathSpreadAttrs(props) @{
  <math id='m-spread-root'>
    <mi id='m-spread' {...props.attrs}/>
  </math>
}
