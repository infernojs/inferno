import { describe, it, expect } from 'vitest';
import { mount } from '../_helpers';
import {
  SvgInIf,
  SvgInForOf,
  SvgInTernary,
  MathInIf,
  MathInForOf,
  MathInTernary,
} from './_fixtures/svg-mathml-namespace.tsrx';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MATHML_NS = 'http://www.w3.org/1998/Math/MathML';

// ============================================================================
// SVG inside @if — runtime insertion via createElementNS
// ============================================================================
describe('namespace — SVG inside @if', () => {
  it('SVG inside @if true-branch gets SVG namespace on every descendant', () => {
    // Mirrors ReactDOMComponent-test.js "should pass SVG namespace down to
    // descendants" — runtime-inserted SVG subtrees must inherit the SVG
    // namespace just like the static template-clone path does.
    const r = mount(SvgInIf, { cond: true });
    const svg = r.find('#svg-if');
    expect(svg.namespaceURI).toBe(SVG_NS);
    expect(svg.tagName).toBe('svg');

    const g = r.find('g.inner');
    expect(g.namespaceURI).toBe(SVG_NS);

    const circle = r.find('circle');
    expect(circle.namespaceURI).toBe(SVG_NS);
    expect(circle.getAttribute('cx')).toBe('5');

    expect(r.findAll('.fallback')).toHaveLength(0);
    r.unmount();
  });

  it('SVG inside @if false-branch correctly unmounts and re-mounts on toggle preserving namespace', () => {
    // Mirrors ReactChildReconciler-test.js — toggling a conditional branch
    // must fully tear down the prior subtree and the new mount must STILL
    // carry the correct namespace. Regression guard against the runtime-path
    // forgetting the parent SVG context on remount.
    const r = mount(SvgInIf, { cond: false });
    expect(r.findAll('#svg-if')).toHaveLength(0);
    expect(r.find('.fallback').textContent).toBe('no-svg');

    // Toggle on — fresh runtime insertion must land in SVG namespace.
    r.update(SvgInIf, { cond: true });
    expect(r.findAll('.fallback')).toHaveLength(0);
    const svg1 = r.find('#svg-if');
    expect(svg1.namespaceURI).toBe(SVG_NS);
    expect(r.find('circle').namespaceURI).toBe(SVG_NS);

    // Toggle off → on a second time — the re-mount path must still set NS.
    r.update(SvgInIf, { cond: false });
    expect(r.findAll('#svg-if')).toHaveLength(0);

    r.update(SvgInIf, { cond: true });
    const svg2 = r.find('#svg-if');
    expect(svg2.namespaceURI).toBe(SVG_NS);
    expect(r.find('g.inner').namespaceURI).toBe(SVG_NS);
    expect(r.find('circle').namespaceURI).toBe(SVG_NS);
    r.unmount();
  });
});

// ============================================================================
// SVG inside @for — keyed reorder must preserve namespace per row
// ============================================================================
describe('namespace — SVG inside @for', () => {
  it('SVG inside @for keyed reorder preserves namespace on every row', () => {
    // Mirrors ReactChildReconciler-test.js "keyed reorder preserves DOM
    // identity" — when keyed children get moved (not destroyed+recreated),
    // their namespaceURI obviously must stay correct; when keys force a fresh
    // mount (e.g. an added row), the new <circle> must ALSO be SVG_NS.
    const r = mount(SvgInForOf, {
      points: [
        { id: 'a', x: 10, y: 10 },
        { id: 'b', x: 20, y: 20 },
        { id: 'c', x: 30, y: 30 },
      ],
    });
    const svg = r.find('#svg-for');
    expect(svg.namespaceURI).toBe(SVG_NS);
    let circles = r.findAll('circle');
    expect(circles).toHaveLength(3);
    for (const c of circles) expect(c.namespaceURI).toBe(SVG_NS);
    const circleA0 = r.find('.pt-a');
    const circleB0 = r.find('.pt-b');

    // Reorder (move b to the front) — moved nodes keep identity and NS.
    r.update(SvgInForOf, {
      points: [
        { id: 'b', x: 20, y: 20 },
        { id: 'a', x: 10, y: 10 },
        { id: 'c', x: 30, y: 30 },
      ],
    });
    expect(r.find('.pt-a')).toBe(circleA0);
    expect(r.find('.pt-b')).toBe(circleB0);
    circles = r.findAll('circle');
    expect(circles).toHaveLength(3);
    for (const c of circles) expect(c.namespaceURI).toBe(SVG_NS);

    // Add a fresh row (new key) — the new node must be created via SVG_NS too.
    r.update(SvgInForOf, {
      points: [
        { id: 'b', x: 20, y: 20 },
        { id: 'a', x: 10, y: 10 },
        { id: 'c', x: 30, y: 30 },
        { id: 'd', x: 40, y: 40 },
      ],
    });
    circles = r.findAll('circle');
    expect(circles).toHaveLength(4);
    for (const c of circles) expect(c.namespaceURI).toBe(SVG_NS);
    expect(r.find('.pt-d').namespaceURI).toBe(SVG_NS);

    // Remove a row — survivors still SVG_NS, NS context unaffected.
    r.update(SvgInForOf, {
      points: [
        { id: 'a', x: 10, y: 10 },
        { id: 'd', x: 40, y: 40 },
      ],
    });
    circles = r.findAll('circle');
    expect(circles).toHaveLength(2);
    for (const c of circles) expect(c.namespaceURI).toBe(SVG_NS);
    r.unmount();
  });
});

// ============================================================================
// SVG inside ternary — both branches must use SVG_NS
// ============================================================================
describe('namespace — SVG inside ternary', () => {
  it('SVG inside ternary {cond ? A : B} — both branches use SVG_NS', () => {
    // Mirrors ReactDOMComponent-test.js — the namespace-inheritance contract
    // applies regardless of which JSX shape produced the child (ternary,
    // directive, plain expression). Each arm gets its own runtime insertion.
    const r = mount(SvgInTernary, { cond: true });
    const svgA = r.find('#svg-a');
    expect(svgA.namespaceURI).toBe(SVG_NS);
    const rect = r.find('rect.r');
    expect(rect.namespaceURI).toBe(SVG_NS);
    expect(r.findAll('#svg-b')).toHaveLength(0);

    r.update(SvgInTernary, { cond: false });
    expect(r.findAll('#svg-a')).toHaveLength(0);
    const svgB = r.find('#svg-b');
    expect(svgB.namespaceURI).toBe(SVG_NS);
    const circle = r.find('circle.c');
    expect(circle.namespaceURI).toBe(SVG_NS);

    // Flip back — the re-mounted A branch must still be SVG_NS.
    r.update(SvgInTernary, { cond: true });
    expect(r.findAll('#svg-b')).toHaveLength(0);
    expect(r.find('#svg-a').namespaceURI).toBe(SVG_NS);
    expect(r.find('rect.r').namespaceURI).toBe(SVG_NS);
    r.unmount();
  });
});

// ============================================================================
// MathML inside @if
// ============================================================================
describe('namespace — MathML inside @if', () => {
  it('MathML inside @if assigns MathML namespace to every descendant', () => {
    // Mirrors ReactDOMComponent-test.js "should pass MathML namespace down"
    // — same contract as SVG but the createElementNS argument is the MathML
    // namespace URI. Asserts both root and every nested descendant.
    const r = mount(MathInIf, { cond: true });
    const math = r.find('#math-if');
    expect(math.namespaceURI).toBe(MATHML_NS);
    expect(math.getAttribute('display')).toBe('block');

    const mrow = math.querySelector('mrow')!;
    expect(mrow.namespaceURI).toBe(MATHML_NS);

    const mi = math.querySelector('mi')!;
    expect(mi.namespaceURI).toBe(MATHML_NS);
    expect(mi.textContent).toBe('x');

    expect(r.findAll('.fallback')).toHaveLength(0);

    // Toggle off + back on — the re-mount path must still use MATHML_NS.
    r.update(MathInIf, { cond: false });
    expect(r.findAll('#math-if')).toHaveLength(0);
    expect(r.find('.fallback').textContent).toBe('no-math');

    r.update(MathInIf, { cond: true });
    const math2 = r.find('#math-if');
    expect(math2.namespaceURI).toBe(MATHML_NS);
    expect(math2.querySelector('mrow')!.namespaceURI).toBe(MATHML_NS);
    expect(math2.querySelector('mi')!.namespaceURI).toBe(MATHML_NS);
    r.unmount();
  });
});

// ============================================================================
// MathML inside @for
// ============================================================================
describe('namespace — MathML inside @for', () => {
  it('MathML inside @for keyed reorder preserves namespace', () => {
    // Mirrors ReactChildReconciler-test.js keyed-reorder contract, applied
    // under a MathML parent so each <mi> must be created via MATHML_NS at
    // runtime — including fresh inserts after a reorder.
    const r = mount(MathInForOf, {
      terms: [
        { id: 'a', s: 'x' },
        { id: 'b', s: 'y' },
        { id: 'c', s: 'z' },
      ],
    });
    const math = r.find('#math-for');
    expect(math.namespaceURI).toBe(MATHML_NS);
    let mis = r.findAll('mi');
    expect(mis).toHaveLength(3);
    for (const m of mis) expect(m.namespaceURI).toBe(MATHML_NS);
    const miA0 = r.find('.term-a');
    const miC0 = r.find('.term-c');

    // Reorder (rotate) — moved nodes keep identity AND namespace.
    r.update(MathInForOf, {
      terms: [
        { id: 'c', s: 'z' },
        { id: 'a', s: 'x' },
        { id: 'b', s: 'y' },
      ],
    });
    expect(r.find('.term-a')).toBe(miA0);
    expect(r.find('.term-c')).toBe(miC0);
    mis = r.findAll('mi');
    expect(mis).toHaveLength(3);
    for (const m of mis) expect(m.namespaceURI).toBe(MATHML_NS);

    // Insert a new term — fresh runtime mount must land in MATHML_NS.
    r.update(MathInForOf, {
      terms: [
        { id: 'c', s: 'z' },
        { id: 'a', s: 'x' },
        { id: 'b', s: 'y' },
        { id: 'd', s: 'w' },
      ],
    });
    mis = r.findAll('mi');
    expect(mis).toHaveLength(4);
    for (const m of mis) expect(m.namespaceURI).toBe(MATHML_NS);
    expect(r.find('.term-d').namespaceURI).toBe(MATHML_NS);

    // Remove some — survivors still MATHML_NS.
    r.update(MathInForOf, {
      terms: [
        { id: 'a', s: 'x' },
        { id: 'd', s: 'w' },
      ],
    });
    mis = r.findAll('mi');
    expect(mis).toHaveLength(2);
    for (const m of mis) expect(m.namespaceURI).toBe(MATHML_NS);
    r.unmount();
  });
});

// ============================================================================
// MathML inside ternary
// ============================================================================
describe('namespace — MathML inside ternary', () => {
  it('MathML inside ternary — both branches use MATHML_NS', () => {
    // Mirrors ReactDOMComponent-test.js MathML namespace inheritance — both
    // arms of a ternary must produce MathML-namespaced runtime nodes.
    const r = mount(MathInTernary, { cond: true });
    const mathA = r.find('#math-a');
    expect(mathA.namespaceURI).toBe(MATHML_NS);
    const left = r.find('mi.left');
    expect(left.namespaceURI).toBe(MATHML_NS);
    expect(left.textContent).toBe('L');
    expect(r.findAll('#math-b')).toHaveLength(0);

    r.update(MathInTernary, { cond: false });
    expect(r.findAll('#math-a')).toHaveLength(0);
    const mathB = r.find('#math-b');
    expect(mathB.namespaceURI).toBe(MATHML_NS);
    const right = r.find('mo.right');
    expect(right.namespaceURI).toBe(MATHML_NS);
    expect(right.textContent).toBe('R');

    // Flip back — re-mounted A arm must still be MATHML_NS.
    r.update(MathInTernary, { cond: true });
    expect(r.findAll('#math-b')).toHaveLength(0);
    expect(r.find('#math-a').namespaceURI).toBe(MATHML_NS);
    expect(r.find('mi.left').namespaceURI).toBe(MATHML_NS);
    r.unmount();
  });
});
