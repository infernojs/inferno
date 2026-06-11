import { describe, it, expect } from 'vitest';
import { mount } from '../_helpers';
import {
  SvgForeignObject,
  SvgInsideForeignObject,
  MathAnnotationXml,
  SvgInMath,
  MathInSvg,
} from './_fixtures/svg-foreign-object.tsrx';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MATHML_NS = 'http://www.w3.org/1998/Math/MathML';
const XHTML_NS = 'http://www.w3.org/1999/xhtml';

// ============================================================================
// Audit Batch 3 — namespace stack push/pop across foreignObject / annotation-xml
// ============================================================================
// Reference: ReactDOMSVG-test.js — pins the HTML5 foreign-content rules that a
// renderer MUST observe when walking from an SVG/MathML parent into an XHTML
// child (and back). inferno-next routes static templates through the HTML5
// parser by wrapping the body in <svg>/<math>, so for STATIC content the
// parser implements these rules for us; for dynamic bindings the compiler's
// nsForSelf / nsForChildren walk (compile.js L44–L55) decides per-host how
// attributes are emitted. These tests guard BOTH paths.

describe('SVG — foreignObject namespace stack', () => {
  it('foreignObject switches inner <div> to XHTML namespace', () => {
    // Mirrors ReactDOMSVG-test.js "renders HTML elements inside foreignObject
    // in the XHTML namespace". The <div> inside the foreignObject must NOT
    // inherit the SVG namespace, even though its parent <foreignObject> is
    // itself an SVG element.
    const r = mount(SvgForeignObject, { label: 'hi' });

    const fo = r.find('foreignObject');
    expect(fo.namespaceURI).toBe(SVG_NS); // foreignObject itself stays SVG

    const inner = r.find('.html-inside');
    expect(inner.namespaceURI).toBe(XHTML_NS);
    expect(inner.tagName.toLowerCase()).toBe('div');

    // The descendant <span> inherits the XHTML namespace from its parent.
    const span = inner.querySelector('span')!;
    expect(span.namespaceURI).toBe(XHTML_NS);
    expect(span.textContent).toBe('hi');
    r.unmount();
  });

  it('sibling <rect> AFTER foreignObject returns to SVG namespace', () => {
    // Mirrors ReactDOMSVG-test.js "siblings after foreignObject return to SVG
    // namespace". After popping out of foreignObject the namespace stack must
    // restore SVG — the following <rect> must NOT be in XHTML.
    const r = mount(SvgForeignObject, { label: 'hi' });

    const rect = r.find('.svg-after');
    expect(rect.namespaceURI).toBe(SVG_NS);
    expect(rect.tagName.toLowerCase()).toBe('rect');
    r.unmount();
  });

  it('deep stack: <svg><foreignObject><div><svg> — inner svg returns to SVG_NS', () => {
    // Mirrors ReactDOMSVG-test.js "deep mixed nesting". The namespace stack
    // pushes svg → html (foreignObject) → svg (inner <svg>). Each level must
    // be tracked independently; the inner <svg>'s descendants are SVG again.
    const r = mount(SvgInsideForeignObject, {});

    const outer = r.find('.outer');
    expect(outer.namespaceURI).toBe(SVG_NS);

    const middle = r.find('.middle');
    expect(middle.namespaceURI).toBe(XHTML_NS);

    const inner = r.find('.inner');
    expect(inner.namespaceURI).toBe(SVG_NS);

    const circle = inner.querySelector('circle')!;
    expect(circle.namespaceURI).toBe(SVG_NS);
    r.unmount();
  });
});

describe('MathML — annotation-xml namespace stack', () => {
  it('annotation-xml encoding=text/html switches inner <div> to XHTML namespace', () => {
    // Mirrors ReactDOMSVG-test.js "annotation-xml with encoding='text/html'
    // switches descendants to HTML". This is the MathML analogue of
    // foreignObject; the HTML5 parser implements it under the foreign-content
    // rules when the encoding attribute matches text/html or application/xhtml+xml.
    const r = mount(MathAnnotationXml, { text: 'inside' });

    const math = r.find('math');
    expect(math.namespaceURI).toBe(MATHML_NS);

    const mn = r.find('mn');
    expect(mn.namespaceURI).toBe(MATHML_NS);
    expect(mn.textContent).toBe('1');

    const div = r.find('.inside-anno');
    expect(div.namespaceURI).toBe(XHTML_NS);
    expect(div.tagName.toLowerCase()).toBe('div');

    const span = div.querySelector('span')!;
    expect(span.namespaceURI).toBe(XHTML_NS);
    expect(span.textContent).toBe('inside');
    r.unmount();
  });

  it('SVG nested inside MathML annotation-xml gets SVG_NS for descendants', () => {
    // Mirrors ReactDOMSVG-test.js "SVG inside MathML annotation-xml". A bare
    // annotation-xml (no encoding=text/html) that contains an <svg> root
    // switches descendants into the SVG namespace — the parser's foreign-
    // content state-machine treats <svg> as a new ns root regardless of the
    // surrounding MathML context.
    const r = mount(SvgInMath, {});

    const svg = r.find('.math-svg');
    expect(svg.namespaceURI).toBe(SVG_NS);
    expect(svg.tagName.toLowerCase()).toBe('svg');

    const circle = svg.querySelector('circle')!;
    expect(circle.namespaceURI).toBe(SVG_NS);
    r.unmount();
  });
});

describe('Mixed — MathML nested inside SVG foreignObject', () => {
  it('MathML nested inside SVG foreignObject gets MATHML_NS for descendants', () => {
    // Mirrors ReactDOMSVG-test.js "MathML inside SVG foreignObject". Stack
    // push order is svg → html (foreignObject) → mathml (math root). The
    // <math> element opens a fresh MathML scope from any XHTML parent — same
    // rule that lets a top-level <math> work from inside an HTML document.
    const r = mount(MathInSvg, {});

    const math = r.find('.svg-math');
    expect(math.namespaceURI).toBe(MATHML_NS);
    expect(math.tagName.toLowerCase()).toBe('math');

    const mrow = math.querySelector('mrow')!;
    expect(mrow.namespaceURI).toBe(MATHML_NS);

    const mi = math.querySelector('mi')!;
    expect(mi.namespaceURI).toBe(MATHML_NS);
    expect(mi.textContent).toBe('x');
    r.unmount();
  });
});
