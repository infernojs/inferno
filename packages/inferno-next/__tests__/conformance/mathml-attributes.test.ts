import { describe, it, expect } from 'vitest';
import { mount } from '../_helpers';
import {
  MathStaticAttrs,
  MathDynamicAttrs,
  MathSpreadAttrs,
} from './_fixtures/mathml-attributes.tsrx';

const MATHML_NS = 'http://www.w3.org/1998/Math/MathML';

// ============================================================================
// MathML attribute breadth + namespace inheritance (Audit Batch 2 — MathML)
// ============================================================================
// Pins runtime attribute handling on MathML hosts: static-template casing,
// dynamic round-trips through setAttribute, null-clear → removeAttribute, and
// the spread surface. Also re-pins that the MathML namespace inherits to all
// descendants across the full create + update lifecycle.

describe('MathML attributes — static-template casing preservation', () => {
  it('MathML static-template attrs preserve casing', () => {
    // Mirrors the SVG static-template breadth check — attributes authored on a
    // MathML element in a static template must reach the DOM under the exact
    // name as written, with no auto-lowercasing / auto-camelCasing applied by
    // the runtime. The HTML5 parser foreign-content rules also place every
    // element in the MathML namespace.
    const r = mount(MathStaticAttrs, {});
    const math = r.find('#m-static');
    const row = r.find('#m-row');
    const op = r.find('#m-op');
    const id = r.find('#m-id');

    // Namespace baseline — host AND descendants are in MathML.
    expect(math.namespaceURI).toBe(MATHML_NS);
    expect(row.namespaceURI).toBe(MATHML_NS);
    expect(op.namespaceURI).toBe(MATHML_NS);
    expect(id.namespaceURI).toBe(MATHML_NS);

    // Attribute names preserved verbatim on the create path.
    expect(math.getAttribute('display')).toBe('block');
    expect(math.getAttribute('displaystyle')).toBe('true');
    expect(math.getAttribute('mathcolor')).toBe('red');
    expect(row.getAttribute('scriptlevel')).toBe('0');
    expect(row.getAttribute('fontstyle')).toBe('italic');
    expect(op.getAttribute('accent')).toBe('true');
    expect(op.getAttribute('accentunder')).toBe('false');
    expect(id.getAttribute('mathvariant')).toBe('bold');
    r.unmount();
  });
});

describe('MathML attributes — dynamic update round-trips', () => {
  it('mathvariant, displaystyle, linethickness, accent dynamic update round-trips through setAttribute', () => {
    // Mirrors the SVG dynamic-update breadth check — each attribute is driven
    // by props so the runtime's setAttribute helper is exercised on both the
    // create (mount) AND update (re-render) paths. Values must round-trip
    // exactly, with no rename / namespace fork.
    const r = mount(MathDynamicAttrs, {
      display: 'block',
      displaystyle: 'true',
      linethickness: 'medium',
      mathvariant: 'bold',
      accent: 'true',
    });
    const math = r.find('#m-dyn');
    const frac = r.find('#m-frac');
    const num = r.find('#m-num');
    const acc = r.find('#m-acc');

    // create path — values land exactly as authored.
    expect(math.namespaceURI).toBe(MATHML_NS);
    expect(frac.namespaceURI).toBe(MATHML_NS);
    expect(num.namespaceURI).toBe(MATHML_NS);
    expect(acc.namespaceURI).toBe(MATHML_NS);
    expect(math.getAttribute('display')).toBe('block');
    expect(math.getAttribute('displaystyle')).toBe('true');
    expect(frac.getAttribute('linethickness')).toBe('medium');
    expect(num.getAttribute('mathvariant')).toBe('bold');
    expect(acc.getAttribute('accent')).toBe('true');

    // update path — re-render with new values, every attribute updates.
    r.update(MathDynamicAttrs, {
      display: 'inline',
      displaystyle: 'false',
      linethickness: 'thick',
      mathvariant: 'italic',
      accent: 'false',
    });
    expect(math.getAttribute('display')).toBe('inline');
    expect(math.getAttribute('displaystyle')).toBe('false');
    expect(frac.getAttribute('linethickness')).toBe('thick');
    expect(num.getAttribute('mathvariant')).toBe('italic');
    expect(acc.getAttribute('accent')).toBe('false');

    // update path — second cycle, ensures the helper isn't a one-shot patch.
    r.update(MathDynamicAttrs, {
      display: 'block',
      displaystyle: 'true',
      linethickness: '2px',
      mathvariant: 'sans-serif',
      accent: 'true',
    });
    expect(math.getAttribute('display')).toBe('block');
    expect(math.getAttribute('displaystyle')).toBe('true');
    expect(frac.getAttribute('linethickness')).toBe('2px');
    expect(num.getAttribute('mathvariant')).toBe('sans-serif');
    expect(acc.getAttribute('accent')).toBe('true');
    r.unmount();
  });
});

describe('MathML attributes — null-clear path', () => {
  it('null-clear removes MathML attributes cleanly', () => {
    // Mirrors the SVG null-clear check — passing null (or false) for an attr
    // value falls through the runtime's setAttribute helper to removeAttribute.
    // After re-render the attribute must be entirely absent from the DOM node,
    // not just set to the empty string. Re-adding round-trips back through the
    // create path on the same node.
    const r = mount(MathDynamicAttrs, {
      display: 'block',
      displaystyle: 'true',
      linethickness: 'medium',
      mathvariant: 'bold',
      accent: 'true',
    });
    const math = r.find('#m-dyn');
    const frac = r.find('#m-frac');
    const num = r.find('#m-num');
    const acc = r.find('#m-acc');

    // sanity — attributes are present before the clear.
    expect(math.hasAttribute('display')).toBe(true);
    expect(math.hasAttribute('displaystyle')).toBe(true);
    expect(frac.hasAttribute('linethickness')).toBe(true);
    expect(num.hasAttribute('mathvariant')).toBe(true);
    expect(acc.hasAttribute('accent')).toBe(true);

    // null clear — every attribute removed entirely.
    r.update(MathDynamicAttrs, {
      display: null,
      displaystyle: null,
      linethickness: null,
      mathvariant: null,
      accent: null,
    });
    expect(math.hasAttribute('display')).toBe(false);
    expect(math.hasAttribute('displaystyle')).toBe(false);
    expect(frac.hasAttribute('linethickness')).toBe(false);
    expect(num.hasAttribute('mathvariant')).toBe(false);
    expect(acc.hasAttribute('accent')).toBe(false);

    // false clear — same helper path, should also drop the attribute.
    r.update(MathDynamicAttrs, {
      display: 'block',
      displaystyle: 'true',
      linethickness: 'medium',
      mathvariant: 'bold',
      accent: 'true',
    });
    expect(acc.getAttribute('accent')).toBe('true');
    r.update(MathDynamicAttrs, {
      display: 'block',
      displaystyle: 'true',
      linethickness: 'medium',
      mathvariant: 'bold',
      accent: false,
    });
    expect(acc.hasAttribute('accent')).toBe(false);

    // Re-add after clear — round-trips back through the create path.
    r.update(MathDynamicAttrs, {
      display: 'inline',
      displaystyle: 'false',
      linethickness: 'thin',
      mathvariant: 'italic',
      accent: 'true',
    });
    expect(math.getAttribute('display')).toBe('inline');
    expect(math.getAttribute('displaystyle')).toBe('false');
    expect(frac.getAttribute('linethickness')).toBe('thin');
    expect(num.getAttribute('mathvariant')).toBe('italic');
    expect(acc.getAttribute('accent')).toBe('true');
    r.unmount();
  });
});

describe('MathML attributes — spread surface', () => {
  it('spread of mathvariant via {...obj} lands as a plain attribute (no namespace)', () => {
    // Mirrors the SVG spread check — `{...obj}` is lowered to `setSpread`,
    // which routes each key through the shared setAttribute helper. For
    // MathML these are plain (non-namespaced) attributes; the resulting
    // attribute node must have namespaceURI === null even though it sits on
    // an element whose own namespaceURI is MathML.
    const r = mount(MathSpreadAttrs, {
      attrs: { mathvariant: 'bold', mathcolor: 'red', class: 'spread' },
    });
    const mi = r.find('#m-spread');
    expect(mi.namespaceURI).toBe(MATHML_NS);
    expect(mi.getAttribute('mathvariant')).toBe('bold');
    expect(mi.getAttribute('mathcolor')).toBe('red');
    expect(mi.getAttribute('class')).toBe('spread');
    // Plain attributes — NO namespace on the attribute node itself.
    expect(mi.getAttributeNode('mathvariant')!.namespaceURI).toBeNull();
    expect(mi.getAttributeNode('mathcolor')!.namespaceURI).toBeNull();

    // Update with a different spread — values round-trip, dropped keys clear.
    r.update(MathSpreadAttrs, { attrs: { mathvariant: 'italic' } });
    expect(mi.getAttribute('mathvariant')).toBe('italic');
    expect(mi.getAttributeNode('mathvariant')!.namespaceURI).toBeNull();
    // Keys that were in `prev` but not in the new spread must be removed.
    expect(mi.hasAttribute('mathcolor')).toBe(false);
    expect(mi.hasAttribute('class')).toBe(false);

    // Empty spread — drops the remaining namespaced-ish keys too.
    r.update(MathSpreadAttrs, { attrs: {} });
    expect(mi.hasAttribute('mathvariant')).toBe(false);
    r.unmount();
  });
});

describe('MathML namespace — inherits through attribute-changing render cycles', () => {
  it('MathML namespace inherits through all attribute-changing render cycles', () => {
    // Pins that attribute updates never accidentally drop a child out of the
    // MathML namespace. The host AND every descendant must remain in
    // MATHML_NS across create, multiple updates, null-clear, and re-add.
    const r = mount(MathDynamicAttrs, {
      display: 'block',
      displaystyle: 'true',
      linethickness: 'medium',
      mathvariant: 'bold',
      accent: 'true',
    });
    const math = r.find('#m-dyn');
    const frac = r.find('#m-frac');
    const num = r.find('#m-num');
    const den = r.find('#m-den');
    const acc = r.find('#m-acc');

    // create — every descendant in MathML namespace.
    expect(math.namespaceURI).toBe(MATHML_NS);
    expect(frac.namespaceURI).toBe(MATHML_NS);
    expect(num.namespaceURI).toBe(MATHML_NS);
    expect(den.namespaceURI).toBe(MATHML_NS);
    expect(acc.namespaceURI).toBe(MATHML_NS);

    // update — change every dynamic value, namespaces must NOT drift.
    r.update(MathDynamicAttrs, {
      display: 'inline',
      displaystyle: 'false',
      linethickness: 'thick',
      mathvariant: 'italic',
      accent: 'false',
    });
    expect(math.namespaceURI).toBe(MATHML_NS);
    expect(frac.namespaceURI).toBe(MATHML_NS);
    expect(num.namespaceURI).toBe(MATHML_NS);
    expect(den.namespaceURI).toBe(MATHML_NS);
    expect(acc.namespaceURI).toBe(MATHML_NS);

    // null-clear — attribute removals must not affect element namespace.
    r.update(MathDynamicAttrs, {
      display: null,
      displaystyle: null,
      linethickness: null,
      mathvariant: null,
      accent: null,
    });
    expect(math.namespaceURI).toBe(MATHML_NS);
    expect(frac.namespaceURI).toBe(MATHML_NS);
    expect(num.namespaceURI).toBe(MATHML_NS);
    expect(den.namespaceURI).toBe(MATHML_NS);
    expect(acc.namespaceURI).toBe(MATHML_NS);

    // re-add — round-trip back through the create path, namespaces hold.
    r.update(MathDynamicAttrs, {
      display: 'block',
      displaystyle: 'true',
      linethickness: 'medium',
      mathvariant: 'bold',
      accent: 'true',
    });
    expect(math.namespaceURI).toBe(MATHML_NS);
    expect(frac.namespaceURI).toBe(MATHML_NS);
    expect(num.namespaceURI).toBe(MATHML_NS);
    expect(den.namespaceURI).toBe(MATHML_NS);
    expect(acc.namespaceURI).toBe(MATHML_NS);
    r.unmount();
  });
});
