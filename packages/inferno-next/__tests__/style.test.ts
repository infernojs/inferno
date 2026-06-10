import { describe, it, expect } from 'vitest';
import { mount } from './_helpers';
import {
  StaticStringStyle, StaticObjectStyle, DynamicObjectStyle, DynamicStringStyle,
  ImportantStyle, CustomPropStyle, PerRowStyle,
  ScopedSingle, ScopedReuse, ScopedOther, ScopedMultiClass, ScopedNested,
  UnscopedLookalike, ScopedDynamic, ScopedToggle, ScopedPlusInlineStyle, StyleAtTop,
} from './_fixtures/style.tsrx';

describe('style prop — static forms', () => {
  it('inlines a static string style into the template (no runtime setStyle)', () => {
    const r = mount(StaticStringStyle);
    const div = r.find('div') as HTMLElement;
    // The exact normalization differs by engine — check parsed CSSOM, not the raw string.
    expect(div.style.color).toBe('red');
    expect(div.style.padding).toBe('4px');
    r.unmount();
  });

  it('inlines a static object literal as a "k: v; k: v" attribute', () => {
    const r = mount(StaticObjectStyle);
    const div = r.find('#box') as HTMLElement;
    expect(div.style.backgroundColor).toBe('red');
    expect(div.style.textAlign).toBe('center');
    // Sanity: it landed in the HTML attribute, not via a runtime call.
    expect(div.getAttribute('style')).toContain('background-color');
    r.unmount();
  });
});

describe('style prop — dynamic object form (setStyle)', () => {
  it('applies an initial object', () => {
    const r = mount(DynamicObjectStyle, { s: { color: 'red', 'font-size': '14px' } });
    const div = r.find('#dyn') as HTMLElement;
    expect(div.style.color).toBe('red');
    expect(div.style.fontSize).toBe('14px');
    r.unmount();
  });

  it('diffs object→object: only changed properties are touched', () => {
    const r = mount(DynamicObjectStyle, { s: { color: 'red', 'font-size': '14px' } });
    const div = r.find('#dyn') as HTMLElement;

    // Change color, keep font-size, add background-color.
    r.update(DynamicObjectStyle, { s: { color: 'blue', 'font-size': '14px', 'background-color': 'yellow' } });
    expect(div.style.color).toBe('blue');
    expect(div.style.fontSize).toBe('14px');
    expect(div.style.backgroundColor).toBe('yellow');

    // Drop background-color — removed property must clear from CSSOM.
    r.update(DynamicObjectStyle, { s: { color: 'blue', 'font-size': '14px' } });
    expect(div.style.backgroundColor).toBe('');
    r.unmount();
  });

  it('clears style when value goes null', () => {
    const r = mount(DynamicObjectStyle, { s: { color: 'red' } });
    const div = r.find('#dyn') as HTMLElement;
    expect(div.style.color).toBe('red');
    r.update(DynamicObjectStyle, { s: null });
    expect(div.style.color).toBe('');
    expect(div.getAttribute('style')).toBeFalsy();
    r.unmount();
  });

  it('transitions string → object (resets cssText, then sets per-prop)', () => {
    const r = mount(DynamicObjectStyle, { s: 'color: red; padding: 3px' } as any);
    const div = r.find('#dyn') as HTMLElement;
    expect(div.style.color).toBe('red');
    expect(div.style.padding).toBe('3px');
    r.update(DynamicObjectStyle, { s: { 'font-weight': 'bold' } });
    expect(div.style.color).toBe('');                    // cleared by transition
    expect(div.style.padding).toBe('');
    expect(div.style.fontWeight).toBe('bold');
    r.unmount();
  });

  it('supports CSS custom properties (--vars)', () => {
    const r = mount(CustomPropStyle, { s: { '--primary': '#abc', '--gap': '8px' } });
    const div = r.find('#cp') as HTMLElement;
    expect(div.style.getPropertyValue('--primary')).toBe('#abc');
    expect(div.style.getPropertyValue('--gap')).toBe('8px');

    r.update(CustomPropStyle, { s: { '--primary': '#000' } });
    expect(div.style.getPropertyValue('--primary')).toBe('#000');
    expect(div.style.getPropertyValue('--gap')).toBe('');   // removed
    r.unmount();
  });

  it('handles "!important" priority on object values', () => {
    const r = mount(ImportantStyle, { s: { color: 'red !important' } });
    const div = r.find('#imp') as HTMLElement;
    expect(div.style.color).toBe('red');
    expect(div.style.getPropertyPriority('color')).toBe('important');

    r.update(ImportantStyle, { s: { color: 'blue' } });
    expect(div.style.color).toBe('blue');
    expect(div.style.getPropertyPriority('color')).toBe('');
    r.unmount();
  });
});

describe('style prop — dynamic string form', () => {
  it('sets cssText directly', () => {
    const r = mount(DynamicStringStyle, { s: 'color: green; padding: 7px' });
    const div = r.find('#ds') as HTMLElement;
    expect(div.style.color).toBe('green');
    expect(div.style.padding).toBe('7px');

    r.update(DynamicStringStyle, { s: 'margin: 3px' });
    expect(div.style.color).toBe('');                  // cleared
    expect(div.style.margin).toBe('3px');
    r.unmount();
  });
});

describe('style prop — inside for-of', () => {
  it('each row keeps its own style across reorders', () => {
    const r = mount(PerRowStyle, {
      items: [
        { id: 1, label: 'a', s: { color: 'red' } },
        { id: 2, label: 'b', s: { color: 'blue' } },
        { id: 3, label: 'c', s: { color: 'green' } },
      ],
    });
    const get = (cls: string) => (r.find(cls) as HTMLElement).style.color;
    expect(get('.r-1')).toBe('red');
    expect(get('.r-2')).toBe('blue');
    expect(get('.r-3')).toBe('green');

    // Reverse the list — refs/styles travel with the keys.
    r.update(PerRowStyle, {
      items: [
        { id: 3, label: 'c', s: { color: 'green' } },
        { id: 2, label: 'b', s: { color: 'blue' } },
        { id: 1, label: 'a', s: { color: 'red' } },
      ],
    });
    expect(get('.r-1')).toBe('red');
    expect(get('.r-2')).toBe('blue');
    expect(get('.r-3')).toBe('green');
    r.unmount();
  });
});

// ---------------------------------------------------------------------------
// Scoped <style> blocks + {style 'cls'}
// ---------------------------------------------------------------------------

function getInjectedStyles(): string[] {
  return Array.from(document.querySelectorAll('style[data-inferno-next]'))
    .map(s => s.getAttribute('data-inferno-next')!);
}

describe('scoped <style> blocks', () => {
  it('injects exactly one <style> tag per module-scoped css hash', () => {
    const before = new Set(getInjectedStyles());
    // First mount of ScopedSingle — inject happened at module init, so just
    // verify the tag is present and unique.
    const r1 = mount(ScopedSingle);
    const r2 = mount(ScopedSingle);
    const r3 = mount(ScopedReuse, { label: 'x' });
    const after = getInjectedStyles();
    // Same-component reuse must not duplicate the <style>.
    const counts: Record<string, number> = {};
    for (const id of after) counts[id] = (counts[id] || 0) + 1;
    for (const id of after) expect(counts[id]).toBe(1);
    // At least our newly-mounted components contributed hashes.
    expect(after.length).toBeGreaterThanOrEqual(before.size);
    r1.unmount(); r2.unmount(); r3.unmount();
  });

  it('applies the hash class so scoped selectors match the element', () => {
    const r = mount(ScopedSingle);
    const div = r.find('div');
    // The element has both the user class and the hash class.
    expect(div.classList.contains('row')).toBe(true);
    // hash class starts with "tsrx-" (provided by @tsrx/core)
    const hashClass = Array.from(div.classList).find(c => c.startsWith('tsrx-'));
    expect(hashClass).toBeTruthy();

    // The computed style picks up the scoped rule.
    expect(getComputedStyle(div).color).toBe('rgb(10, 20, 30)');
    r.unmount();
  });

  it('different components get different hashes (scoping isolates CSS)', () => {
    const r1 = mount(ScopedSingle);
    const r2 = mount(ScopedOther);
    const h1 = Array.from(r1.find('div').classList).find(c => c.startsWith('tsrx-'))!;
    const h2 = Array.from(r2.find('div').classList).find(c => c.startsWith('tsrx-'))!;
    expect(h1).not.toBe(h2);
    expect(getComputedStyle(r1.find('div')).color).toBe('rgb(10, 20, 30)');
    expect(getComputedStyle(r2.find('div')).color).toBe('rgb(0, 200, 0)');
    r1.unmount(); r2.unmount();
  });

  it('an element without {style ...} does NOT pick up scoped styles even if class name matches', () => {
    const r1 = mount(ScopedSingle);             // ensures .row CSS is injected
    const r2 = mount(UnscopedLookalike);        // has class="row" but no hash
    expect(r2.find('div').classList.contains('row')).toBe(true);
    // No hash class — scoped selector .row.tsrx-XXX doesn't match.
    expect(Array.from(r2.find('div').classList).some(c => c.startsWith('tsrx-'))).toBe(false);
    // Computed color should be the browser default (NOT rgb(10,20,30)).
    expect(getComputedStyle(r2.find('div')).color).not.toBe('rgb(10, 20, 30)');
    r1.unmount(); r2.unmount();
  });

  it('supports multiple classes in one {style "a b"}', () => {
    const r = mount(ScopedMultiClass);
    const div = r.find('div');
    expect(div.classList.contains('a')).toBe(true);
    expect(div.classList.contains('b')).toBe(true);
    expect(Array.from(div.classList).some(c => c.startsWith('tsrx-'))).toBe(true);
    r.unmount();
  });

  it('descendant selectors only match opted-in descendants (hash gate)', () => {
    const r = mount(ScopedNested);
    const outer = r.find('div');
    const innerScoped = r.find('span.inner');
    const innerUnscoped = Array.from(outer.querySelectorAll('span')).find(s => !s.classList.contains('inner'))!;

    // The hash on outer + .inner descendant with hash should match.
    expect(Array.from(innerScoped.classList).some(c => c.startsWith('tsrx-'))).toBe(true);
    expect(getComputedStyle(innerScoped).fontWeight).toBe('bold');

    // New TSRX scoping (annotateWithHash) adds the hash to every element under
    // the component — the gate against cross-component leakage is the SELECTOR
    // (`.outer.<hash> .inner.<hash>`), not per-element opt-in. The unscoped
    // sibling DOES carry the hash but still doesn't match `.inner.<hash>`,
    // because it lacks the `.inner` class. Visual behavior is identical to the
    // old `{style 'cls'}` opt-in model.
    expect(Array.from(innerUnscoped.classList).some(c => c.startsWith('tsrx-'))).toBe(true);
    expect(getComputedStyle(innerUnscoped).fontWeight).not.toBe('bold');
    r.unmount();
  });

  it('dynamic class via {style (expr)} concatenates hash at runtime', () => {
    const r = mount(ScopedDynamic, { cls: 'alpha' });
    const div = r.find('div');
    expect(div.classList.contains('alpha')).toBe(true);
    expect(getComputedStyle(div).color).toBe('rgb(11, 22, 33)');

    r.update(ScopedDynamic, { cls: 'beta' });
    expect(div.classList.contains('alpha')).toBe(false);
    expect(div.classList.contains('beta')).toBe(true);
    expect(getComputedStyle(div).color).toBe('rgb(44, 55, 66)');
    r.unmount();
  });

  it('toggles between scoped classes via state', () => {
    const r = mount(ScopedToggle);
    const lbl = r.find('#lbl');
    expect(lbl.classList.contains('off')).toBe(true);
    expect(getComputedStyle(lbl).color).toBe('rgb(8, 8, 8)');
    r.click('#t');
    expect(lbl.classList.contains('on')).toBe(true);
    expect(lbl.classList.contains('off')).toBe(false);
    expect(getComputedStyle(lbl).color).toBe('rgb(7, 7, 7)');
    r.unmount();
  });

  it('combines a scoped class with a dynamic inline style on the same element', () => {
    const r = mount(ScopedPlusInlineStyle, { s: { color: 'rgb(99, 99, 99)' } });
    const div = r.find('#mix') as HTMLElement;
    expect(div.classList.contains('base')).toBe(true);
    expect(div.style.color).toBe('rgb(99, 99, 99)');
    // Scoped padding rule still applies under the hash class.
    expect(getComputedStyle(div).padding).toBe('5px');

    r.update(ScopedPlusInlineStyle, { s: { color: 'rgb(11, 11, 11)' } });
    expect(div.style.color).toBe('rgb(11, 11, 11)');
    expect(getComputedStyle(div).padding).toBe('5px');
    r.unmount();
  });

  it('accepts <style> placed before any JSX', () => {
    const r = mount(StyleAtTop);
    const div = r.find('div');
    expect(div.classList.contains('top')).toBe(true);
    expect(getComputedStyle(div).color).toBe('rgb(1, 2, 3)');
    r.unmount();
  });
});
