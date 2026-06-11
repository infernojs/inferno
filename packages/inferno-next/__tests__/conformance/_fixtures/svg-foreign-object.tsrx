// ============================================================================
// Audit Batch 3 — foreignObject + annotation-xml + mixed namespace nesting
// ============================================================================
// React: ReactDOMSVG-test.js (foreignObject namespace tests). Pins the
// namespace-stack push/pop semantics enforced by the HTML5 foreign-content
// parsing rules: <foreignObject> children switch to XHTML; the sibling after
// it pops back to SVG; MathML <annotation-xml encoding='text/html'> children
// also switch to XHTML; and SVG-in-Math / Math-in-SVG nesting keeps the
// per-level namespace correct via the compiler's nsForChildren walk.

export function SvgForeignObject(props) @{
  <svg>
    <foreignObject>
      <div class='html-inside'>
        <span>{props.label as string}</span>
      </div>
    </foreignObject>
    <rect class='svg-after'/>
  </svg>
}

export function SvgInsideForeignObject(props) @{
  <div>
    <svg class='outer'>
      <foreignObject>
        <div class='middle'>
          <svg class='inner'>
            <circle/>
          </svg>
        </div>
      </foreignObject>
    </svg>
  </div>
}

export function MathAnnotationXml(props) @{
  <math>
    <semantics>
      <mrow>
        <mn>{'1'}</mn>
      </mrow>
      <annotation-xml encoding='text/html'>
        <div class='inside-anno'>
          <span>{props.text as string}</span>
        </div>
      </annotation-xml>
    </semantics>
  </math>
}

export function SvgInMath(props) @{
  <math>
    <mrow>
      <mi>{'a'}</mi>
      <semantics>
        <annotation-xml>
          <svg class='math-svg'>
            <circle/>
          </svg>
        </annotation-xml>
      </semantics>
    </mrow>
  </math>
}

export function MathInSvg(props) @{
  <svg>
    <foreignObject>
      <math class='svg-math'>
        <mrow>
          <mi>{'x'}</mi>
        </mrow>
      </math>
    </foreignObject>
  </svg>
}
