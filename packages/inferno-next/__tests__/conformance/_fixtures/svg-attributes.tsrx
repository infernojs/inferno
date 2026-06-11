import { useState } from 'inferno-next';

// ============================================================================
// SVG attribute breadth + namespace decision (Audit Batch 2)
// ============================================================================
// These fixtures pin Inferno-next's runtime attribute handling on SVG hosts.
// Each fixture exposes a single dynamic surface driven by props, so the test
// can exercise both the create (initial mount) and the update (re-render with
// changed props) paths via mount() + update().

// ---------------------------------------------------------------------------
// camelCase SVG attributes — must round-trip through setAttribute WITHOUT
// being lowercased. References: ReactDOMSVG-test.js (preserveAspectRatio,
// gradientTransform), ReactDOMComponent-test.js (SVG attribute casing).
// ---------------------------------------------------------------------------
export function SvgCamelAttrs(props) @{
  <svg
    id='cam'
    viewBox='0 0 200 200'
    preserveAspectRatio={props.preserveAspectRatio}
  >
    <defs>
      <linearGradient
        id='lg'
        gradientTransform={props.gradientTransform}
        gradientUnits={props.gradientUnits}
      />
      <clipPath id='cp' clipPathUnits={props.clipPathUnits} />
      <marker id='mk' markerWidth={props.markerWidth} />
      <pattern id='pt' patternUnits={props.patternUnits} />
    </defs>
    <text id='tx' x='10' y='20' textLength={props.textLength}>{'hi'}</text>
  </svg>
}

// ---------------------------------------------------------------------------
// kebab-case SVG attributes — must NOT be auto-camelCased; pass through
// verbatim. Reference: ReactDOMComponent-test.js (stroke-width, fill-opacity).
// ---------------------------------------------------------------------------
export function SvgKebabAttrs(props) @{
  <svg id='kebab' viewBox='0 0 100 100'>
    <line
      id='ln'
      x1='0'
      y1='0'
      x2='50'
      y2='50'
      stroke-width={props.strokeWidth}
      stroke-dasharray={props.strokeDasharray}
      stroke-linecap={props.strokeLinecap}
    />
    <rect
      id='rc'
      x='0'
      y='0'
      width='30'
      height='30'
      fill-opacity={props.fillOpacity}
      clip-path={props.clipPath}
    />
  </svg>
}

// ---------------------------------------------------------------------------
// xml:* attributes — JSXNamespacedName tokens. We pin the CURRENT behavior:
// Inferno emits a literal `xml:lang` / `xml:space` via setAttribute (no
// xmlns-aware path). Note in test that this diverges from React's
// setAttributeNS routing.
// ---------------------------------------------------------------------------
export function SvgXmlAttrs(props) @{
  <svg id='xml' viewBox='0 0 50 50' xml:lang={props.lang} xml:space={props.space}>
    <text id='xt' x='5' y='15'>{'ns'}</text>
  </svg>
}

// ---------------------------------------------------------------------------
// xlink:href clear-to-null — when an attribute is unset (value == null or
// false), the runtime's setAttribute helper falls through to removeAttribute.
// Pins that the namespaced form participates in the same clear path.
// Reference: ReactDOMComponent-test.js (xlink namespace + null clear).
// ---------------------------------------------------------------------------
export function SvgXlinkClear(props) @{
  <svg id='xlink-root' viewBox='0 0 50 50'>
    <use id='use-el' xlink:href={props.href}/>
  </svg>
}

// ---------------------------------------------------------------------------
// Plain `href` on SVG <a> — modern SVG (SVG2) accepts plain `href` without
// the xlink namespace. Verifies the attribute is set as-is via setAttribute,
// no special-casing, and that <a> is in the SVG namespace because parent is.
// ---------------------------------------------------------------------------
export function SvgPlainHref(props) @{
  <svg id='aroot' viewBox='0 0 50 50'>
    <a id='alink' href={props.href}>
      <rect x='0' y='0' width='10' height='10' />
    </a>
  </svg>
}

// ---------------------------------------------------------------------------
// Dynamic `class` on SVG element — must NOT route to setClassName / the
// .className property assignment (SVGElement.className is a read-only
// SVGAnimatedString in browsers). Compiler emits setAttribute(el,'class',...)
// for SVG hosts; this fixture exercises both create + update of the class
// attribute on the inner <circle>.
// ---------------------------------------------------------------------------
export function SvgClassPath(props) @{
  <svg id='cls-root' viewBox='0 0 100 100'>
    <circle id='cls-c' cx='50' cy='50' r='40' class={props.cls}/>
  </svg>
}
