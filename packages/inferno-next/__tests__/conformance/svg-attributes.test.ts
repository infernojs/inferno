import { describe, it, expect } from 'vitest';
import { mount } from '../_helpers';
import {
  SvgCamelAttrs,
  SvgKebabAttrs,
  SvgXmlAttrs,
  SvgXlinkClear,
  SvgPlainHref,
  SvgClassPath,
} from './_fixtures/svg-attributes.tsrx';

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

// ============================================================================
// SVG attribute breadth + namespace decision (Audit Batch 2)
// ============================================================================
// Pins runtime attribute handling on SVG hosts: casing, kebab-case, namespaced
// attributes, xlink null-clear, modern plain href, and class routing.

describe('SVG attributes — camelCase preservation', () => {
  it('preserveAspectRatio camelCase is preserved on the DOM attribute name', () => {
    // Mirrors ReactDOMSVG-test.js — SVG attributes that REQUIRE camelCase
    // (preserveAspectRatio) must not be lowercased en route to the DOM.
    const r = mount(SvgCamelAttrs, {
      preserveAspectRatio: 'xMidYMid meet',
      gradientTransform: 'rotate(45)',
      gradientUnits: 'userSpaceOnUse',
      clipPathUnits: 'userSpaceOnUse',
      markerWidth: '4',
      patternUnits: 'userSpaceOnUse',
      textLength: '40',
    });
    const svg = r.find('#cam');
    expect(svg.namespaceURI).toBe(SVG_NS);
    expect(svg.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
    // Lowercased form must NOT be present.
    expect(svg.hasAttribute('preserveaspectratio')).toBe(false);

    // Update path — re-render with a new value still preserves casing.
    r.update(SvgCamelAttrs, {
      preserveAspectRatio: 'xMinYMin slice',
      gradientTransform: 'rotate(90)',
      gradientUnits: 'objectBoundingBox',
      clipPathUnits: 'objectBoundingBox',
      markerWidth: '8',
      patternUnits: 'objectBoundingBox',
      textLength: '80',
    });
    expect(svg.getAttribute('preserveAspectRatio')).toBe('xMinYMin slice');
    expect(svg.hasAttribute('preserveaspectratio')).toBe(false);
    r.unmount();
  });

  it('gradientTransform, clipPathUnits, markerWidth, patternUnits, textLength, gradientUnits all preserve casing', () => {
    // Mirrors ReactDOMComponent-test.js — broad sweep across the camelCase
    // SVG attribute set; create + update both paths.
    const r = mount(SvgCamelAttrs, {
      preserveAspectRatio: 'xMidYMid meet',
      gradientTransform: 'rotate(45)',
      gradientUnits: 'userSpaceOnUse',
      clipPathUnits: 'userSpaceOnUse',
      markerWidth: '4',
      patternUnits: 'userSpaceOnUse',
      textLength: '40',
    });
    const lg = r.find('#lg');
    const cp = r.find('#cp');
    const mk = r.find('#mk');
    const pt = r.find('#pt');
    const tx = r.find('#tx');

    // create path — casing intact on each attribute.
    expect(lg.getAttribute('gradientTransform')).toBe('rotate(45)');
    expect(lg.getAttribute('gradientUnits')).toBe('userSpaceOnUse');
    expect(cp.getAttribute('clipPathUnits')).toBe('userSpaceOnUse');
    expect(mk.getAttribute('markerWidth')).toBe('4');
    expect(pt.getAttribute('patternUnits')).toBe('userSpaceOnUse');
    expect(tx.getAttribute('textLength')).toBe('40');
    // The lowercased aliases must not have been set.
    expect(lg.hasAttribute('gradienttransform')).toBe(false);
    expect(cp.hasAttribute('clippathunits')).toBe(false);
    expect(mk.hasAttribute('markerwidth')).toBe(false);
    expect(pt.hasAttribute('patternunits')).toBe(false);
    expect(tx.hasAttribute('textlength')).toBe(false);
    expect(lg.hasAttribute('gradientunits')).toBe(false) ; // i.e. lower form absent — quick sanity (real attr present above)

    // update path — every camelCase attribute updates to a new value.
    r.update(SvgCamelAttrs, {
      preserveAspectRatio: 'none',
      gradientTransform: 'scale(2)',
      gradientUnits: 'objectBoundingBox',
      clipPathUnits: 'objectBoundingBox',
      markerWidth: '12',
      patternUnits: 'objectBoundingBox',
      textLength: '120',
    });
    expect(lg.getAttribute('gradientTransform')).toBe('scale(2)');
    expect(lg.getAttribute('gradientUnits')).toBe('objectBoundingBox');
    expect(cp.getAttribute('clipPathUnits')).toBe('objectBoundingBox');
    expect(mk.getAttribute('markerWidth')).toBe('12');
    expect(pt.getAttribute('patternUnits')).toBe('objectBoundingBox');
    expect(tx.getAttribute('textLength')).toBe('120');
    r.unmount();
  });
});

describe('SVG attributes — kebab-case passthrough', () => {
  it('kebab-case stroke-* attributes are preserved as-is', () => {
    // Mirrors ReactDOMComponent-test.js — kebab attributes (stroke-width,
    // stroke-dasharray, fill-opacity, clip-path, stroke-linecap) must NOT be
    // auto-camelCased by the runtime; they are SVG presentation attrs that
    // require the kebab spelling on the DOM.
    const r = mount(SvgKebabAttrs, {
      strokeWidth: '2',
      strokeDasharray: '4 2',
      strokeLinecap: 'round',
      fillOpacity: '0.5',
      clipPath: 'url(#cp)',
    });
    const ln = r.find('#ln');
    const rc = r.find('#rc');
    expect(ln.getAttribute('stroke-width')).toBe('2');
    expect(ln.getAttribute('stroke-dasharray')).toBe('4 2');
    expect(ln.getAttribute('stroke-linecap')).toBe('round');
    expect(rc.getAttribute('fill-opacity')).toBe('0.5');
    expect(rc.getAttribute('clip-path')).toBe('url(#cp)');
    // CamelCased forms must NOT have been emitted.
    expect(ln.hasAttribute('strokeWidth')).toBe(false);
    expect(ln.hasAttribute('strokeDasharray')).toBe(false);
    expect(rc.hasAttribute('fillOpacity')).toBe(false);

    // update path — kebab spelling stays.
    r.update(SvgKebabAttrs, {
      strokeWidth: '5',
      strokeDasharray: '10 2 4',
      strokeLinecap: 'butt',
      fillOpacity: '0.9',
      clipPath: 'url(#cp2)',
    });
    expect(ln.getAttribute('stroke-width')).toBe('5');
    expect(ln.getAttribute('stroke-dasharray')).toBe('10 2 4');
    expect(ln.getAttribute('stroke-linecap')).toBe('butt');
    expect(rc.getAttribute('fill-opacity')).toBe('0.9');
    expect(rc.getAttribute('clip-path')).toBe('url(#cp2)');
    r.unmount();
  });
});

describe('SVG attributes — xml: namespaced attributes', () => {
  it('xml:lang and xml:space are accepted as namespaced attributes', () => {
    // Mirrors ReactDOMComponent-test.js (xml namespace tests) — the user
    // writes xml:lang / xml:space; the DOM must report the value under that
    // qualified name. NOTE: Inferno currently emits via setAttribute (literal
    // qualified name), which differs from React's setAttributeNS routing —
    // see `notes`. The DOM-level getAttribute lookup still works either way.
    const r = mount(SvgXmlAttrs, { lang: 'en', space: 'preserve' });
    const svg = r.find('#xml');
    expect(svg.namespaceURI).toBe(SVG_NS);
    expect(svg.getAttribute('xml:lang')).toBe('en');
    expect(svg.getAttribute('xml:space')).toBe('preserve');

    // update path — change the value, the qualified name stays.
    r.update(SvgXmlAttrs, { lang: 'fr', space: 'default' });
    expect(svg.getAttribute('xml:lang')).toBe('fr');
    expect(svg.getAttribute('xml:space')).toBe('default');

    // Clear path — null removes the attribute entirely.
    r.update(SvgXmlAttrs, { lang: null, space: null });
    expect(svg.hasAttribute('xml:lang')).toBe(false);
    expect(svg.hasAttribute('xml:space')).toBe(false);
    r.unmount();
  });
});

describe('SVG attributes — xlink:href null clear', () => {
  it('xlink:href={null} removes the attribute', () => {
    // Mirrors ReactDOMComponent-test.js — passing null/undefined for an
    // xlink:href clears the attribute. Pins CURRENT Inferno behavior: the
    // qualified name "xlink:href" is set/removed via plain setAttribute /
    // removeAttribute. namespaceURI of the resulting attribute is null in
    // Inferno (NOT the XLink namespace as React would produce via
    // setAttributeNS). See `notes` for divergence rationale.
    const r = mount(SvgXlinkClear, { href: '#sprite' });
    const use = r.find('#use-el');
    expect(use.namespaceURI).toBe(SVG_NS);
    expect(use.getAttribute('xlink:href')).toBe('#sprite');

    // Pin divergence: Inferno's path leaves the attribute's own namespaceURI
    // as null. React's path would set it to the XLink namespace.
    const node = use.getAttributeNode('xlink:href');
    expect(node).not.toBeNull();
    // Either null (Inferno today) OR XLINK_NS (React semantics) — assert the
    // observed value of one of the two and surface the divergence in `notes`.
    expect([null, XLINK_NS]).toContain(node!.namespaceURI);
    // Current Inferno behavior — record explicitly so a future change in
    // routing is flagged.
    expect(node!.namespaceURI).toBe(null);

    // Re-render to a different href — update path still works through the
    // same qualified name.
    r.update(SvgXlinkClear, { href: '#other' });
    expect(use.getAttribute('xlink:href')).toBe('#other');

    // Null clear — attribute removed.
    r.update(SvgXlinkClear, { href: null });
    expect(use.hasAttribute('xlink:href')).toBe(false);

    // Re-add after clear — round-trip back through the create path.
    r.update(SvgXlinkClear, { href: '#third' });
    expect(use.getAttribute('xlink:href')).toBe('#third');
    r.unmount();
  });
});

describe('SVG attributes — plain href on SVG <a>', () => {
  it('plain href on SVG <a> sets the href attribute (no xlink namespace required)', () => {
    // Mirrors ReactDOMSVG-test.js — SVG2's modern <a href="..."> form should
    // pass through as a plain attribute, no xlink-namespace special-casing.
    const r = mount(SvgPlainHref, { href: '/foo' });
    const a = r.find('#alink');
    expect(a.namespaceURI).toBe(SVG_NS);                    // inherits parent <svg>'s namespace
    expect(a.getAttribute('href')).toBe('/foo');
    // No xlink:href shadow attribute should have been emitted.
    expect(a.hasAttribute('xlink:href')).toBe(false);

    // update path — change href, namespace stays.
    r.update(SvgPlainHref, { href: '/bar' });
    expect(a.getAttribute('href')).toBe('/bar');
    expect(a.hasAttribute('xlink:href')).toBe(false);

    // Null clear — href removed cleanly.
    r.update(SvgPlainHref, { href: null });
    expect(a.hasAttribute('href')).toBe(false);
    r.unmount();
  });
});

describe('SVG attributes — class routing', () => {
  it('dynamic class on SVG element uses setAttribute path — className.baseVal reflects the change', () => {
    // Mirrors ReactDOMComponent-test.js (SVG className handling) — assigning
    // to .className on an SVGElement is a no-op in real browsers (the prop is
    // a read-only SVGAnimatedString). The runtime MUST route via
    // setAttribute(el,'class',...) instead. We verify by inspecting BOTH the
    // attribute AND the className.baseVal mirror — both must reflect the new
    // value on create AND update.
    const r = mount(SvgClassPath, { cls: 'a' });
    const c = r.find('#cls-c');
    expect(c.namespaceURI).toBe(SVG_NS);
    expect(c.getAttribute('class')).toBe('a');
    // baseVal is the live mirror of the class attribute in the DOM. If the
    // runtime had wrongly assigned to .className (the SVGAnimatedString), the
    // attribute would be empty and baseVal would be '' — fail.
    expect((c as any).className.baseVal).toBe('a');

    // update path — change class, both surfaces update.
    r.update(SvgClassPath, { cls: 'b c' });
    expect(c.getAttribute('class')).toBe('b c');
    expect((c as any).className.baseVal).toBe('b c');

    // Null clear — class attribute removed.
    r.update(SvgClassPath, { cls: null });
    expect(c.hasAttribute('class')).toBe(false);
    expect((c as any).className.baseVal).toBe('');
    r.unmount();
  });
});
