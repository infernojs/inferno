// ============================================================================
// SVG/MathML runtime-insertion baseline — Audit Batch 1
// ============================================================================
// The static-template-clone path (covered by basic.test.ts) places <svg> /
// <math> children in the right namespace via HTML5 parser foreign-content
// rules. Runtime-inserted children — those born from @if branches, @for
// bodies, ternary expressions — instead travel through createElementNS at
// commit time. This fixture exercises every such runtime path so we can
// assert namespaceURI on each descendant created at runtime.

// ----------------------------------------------------------------------------
// SVG inside @if
// ----------------------------------------------------------------------------
export function SvgInIf(props) @{
  <>
    @if (props.cond) {
      <svg id='svg-if' viewBox='0 0 10 10'>
        <g class='inner'>
          <circle cx='5' cy='5' r='4' />
        </g>
      </svg>
    } @else {
      <span class='fallback'>{'no-svg'}</span>
    }
  </>
}

// ----------------------------------------------------------------------------
// SVG inside @for (keyed list) — assert namespace survives reorder/add/remove
// ----------------------------------------------------------------------------
export function SvgInForOf(props) @{
  <svg id='svg-for' viewBox='0 0 100 100'>
    @for (const p of props.points; key p.id) {
      <circle class={'pt pt-' + p.id} cx={p.x} cy={p.y} r='5' />
    }
  </svg>
}

// ----------------------------------------------------------------------------
// SVG inside ternary — both arms allocated at runtime
// ----------------------------------------------------------------------------
export function SvgInTernary(props) @{
  <div id='ternary-host'>
    {props.cond ? <><svg id='svg-a'><rect class='r' x='0' y='0' width='5' height='5'/></svg></> : <><svg id='svg-b'><circle class='c' cx='1' cy='1' r='1'/></svg></>}
  </div>
}

// ----------------------------------------------------------------------------
// MathML inside @if
// ----------------------------------------------------------------------------
export function MathInIf(props) @{
  <>
    @if (props.cond) {
      <math id='math-if' display='block'>
        <mrow>
          <mi>{'x'}</mi>
        </mrow>
      </math>
    } @else {
      <span class='fallback'>{'no-math'}</span>
    }
  </>
}

// ----------------------------------------------------------------------------
// MathML inside @for (keyed)
// ----------------------------------------------------------------------------
export function MathInForOf(props) @{
  <math id='math-for'>
    <mrow>
      @for (const t of props.terms; key t.id) {
        <mi class={'term term-' + t.id}>{t.s as string}</mi>
      }
    </mrow>
  </math>
}

// ----------------------------------------------------------------------------
// MathML inside ternary
// ----------------------------------------------------------------------------
export function MathInTernary(props) @{
  <div id='math-ternary-host'>
    {props.cond ? <><math id='math-a'><mi class='left'>{'L'}</mi></math></> : <><math id='math-b'><mo class='right'>{'R'}</mo></math></>}
  </div>
}
