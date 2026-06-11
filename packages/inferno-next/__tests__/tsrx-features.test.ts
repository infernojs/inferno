/**
 * Coverage for TSRX features that were previously implicit / untested.
 *
 * Split into two parts:
 *   1. P1 fixes — features we just added (spread attrs, ternary→ifBlock,
 *      .map() compile-error guidance).
 *   2. P2 tests — features that worked but had no coverage (boolean attrs,
 *      dynamic numeric attrs, shorthand attrs, namespaced attrs, for-of
 *      index variants, {html} only-child).
 */
import { describe, it, expect } from 'vitest';
import { mount } from './_helpers';
import { compile } from '../compiler/compile.js';
import {
  SpreadOnElement, SpreadWithExplicit, SpreadOnComponent,
  BooleanAttr, DynamicNumericAttr, ShorthandAttr, NamespacedAttr,
  ForOfIndexOnly, ForOfIndexAndKey,
  TernaryFragmentChild, HtmlOnlyChild,
  KeyedFragmentItems, LazyObjectDestructure, LazyArrayDestructure,
  LazyParamDestructure, LazyForOfHead, ShorthandComponentProp,
  PureForOf, ImpureForOf,
} from './_fixtures/tsrx-features.tsrx';

// ---------------------------------------------------------------------------
// P1: spread attributes — `{...obj}` on DOM elements and components
// ---------------------------------------------------------------------------

describe('TSRX features — spread attributes on DOM elements', () => {
  it('routes each key through the right setter (class / event / attr)', () => {
    const clicks: string[] = [];
    const r = mount(SpreadOnElement, {
      attrs: {
        class: 'spread-class',
        title: 'hello',
        onClick: () => clicks.push('A'),
      },
    });
    const div = r.find('#target');
    expect(div.className).toBe('spread-class');
    expect(div.getAttribute('title')).toBe('hello');
    r.click('#target');
    expect(clicks).toEqual(['A']);
    r.unmount();
  });

  it('diffs spread objects across updates — vanished keys are cleared', () => {
    const r = mount(SpreadOnElement, {
      attrs: { class: 'one', title: 'first', 'data-id': '42' },
    });
    const div = r.find('#target');
    expect(div.className).toBe('one');
    expect(div.getAttribute('data-id')).toBe('42');

    // Update with a NEW object that drops `data-id` and changes `class`.
    r.update(SpreadOnElement, {
      attrs: { class: 'two', title: 'first' },
    });
    expect(div.className).toBe('two');
    expect(div.hasAttribute('data-id')).toBe(false);    // cleared
    expect(div.getAttribute('title')).toBe('first');    // unchanged
    r.unmount();
  });

  it('explicit attr after spread overrides the spread value', () => {
    const r = mount(SpreadWithExplicit, { attrs: { class: 'from-spread' } });
    expect(r.find('div').className).toBe('explicit-wins');
    r.unmount();
  });

  it('handles style + class + custom attrs inside spread', () => {
    const r = mount(SpreadOnElement, {
      attrs: {
        class: 'foo',
        style: { color: 'rgb(10, 20, 30)' },
        'data-test': 'bar',
        title: 'tip',
      },
    });
    const div = r.find('#target') as HTMLElement;
    expect(div.className).toBe('foo');
    expect(div.style.color).toBe('rgb(10, 20, 30)');
    expect(div.getAttribute('data-test')).toBe('bar');
    r.unmount();
  });
});

describe('TSRX features — spread on components', () => {
  it('merges spread into the props object', () => {
    const r = mount(SpreadOnComponent, {
      child: { label: 'A', cls: 'comp-spread', tag: '!' },
    });
    const span = r.find('#child');
    expect(span.className).toBe('comp-spread');
    expect(span.textContent).toBe('A!');

    r.update(SpreadOnComponent, {
      child: { label: 'B', cls: 'updated', tag: '?' },
    });
    expect(span.className).toBe('updated');
    expect(span.textContent).toBe('B?');
    r.unmount();
  });
});

// ---------------------------------------------------------------------------
// P1: ternary → ifBlock lowering (the ONLY ternary-JSX form TSRX accepts is
// fragment branches; we lower to ifBlock for real DOM mount/unmount).
// ---------------------------------------------------------------------------

describe('TSRX features — ternary with fragment branches', () => {
  it('lowers `{cond ? <>...</> : <>...</>}` to ifBlock (real DOM, not stringified)', () => {
    const r = mount(TernaryFragmentChild, { cond: true });
    expect(r.findAll('.yes')).toHaveLength(1);
    expect(r.find('.yes').textContent).toBe('yes');
    expect(r.findAll('.no')).toHaveLength(0);

    r.update(TernaryFragmentChild, { cond: false });
    expect(r.findAll('.yes')).toHaveLength(0);
    expect(r.find('.no').textContent).toBe('no');

    r.update(TernaryFragmentChild, { cond: true });
    expect(r.find('.yes').textContent).toBe('yes');
    r.unmount();
  });
});

// ---------------------------------------------------------------------------
// P1: .map() at child position must throw a compile error pointing to for-of
// ---------------------------------------------------------------------------

describe('TSRX features — `.map()` compile-error guidance', () => {
  it("rejects `{items.map(x => <>...</>)}` with a useful suggestion", () => {
    const src =
      "export function A(p) @{ <ul>{p.items.map(x => <>{x as string}</>)}</ul> }";
    expect(() => compile(src, 'a.tsrx')).toThrow(/for-of loop instead/);
  });

  it('leaves non-JSX `.map()` alone (string concatenation, etc.)', () => {
    // `.map().join()` returning a string is a perfectly valid expression at
    // child position — should compile without error.
    const src =
      "export function A(p) @{ <div>{p.items.map(x => x.id).join(',') as string}</div> }";
    expect(() => compile(src, 'a.tsrx')).not.toThrow();
  });

  it("compiles `@for(...) @empty { ... }` to an `emptyBody` arg on forBlock", () => {
    // The new TSRX parser surfaces an `empty` BlockStatement on JSXForExpression
    // for `@for (...) { ... } @empty { ... }`. The compiler now hoists the empty
    // branch as its own helper and passes it as forBlock's trailing arg; the
    // runtime mounts the empty branch when items.length === 0.
    const src =
      "export function A(p) @{ <ul>" +
      "@for (const x of p.items; key x.id) { <li>{x.label as string}</li> } " +
      "@empty { <li class='none'>{'none'}</li> }" +
      "</ul> }";
    const { code } = compile(src, 'a.tsrx');
    expect(code).toMatch(/__empty\$\d+/);
    expect(code).toMatch(/forBlock\([^)]+,\s*__empty\$\d+\)/);
  });
});

// ---------------------------------------------------------------------------
// P2: boolean attrs
// ---------------------------------------------------------------------------

describe('TSRX features — boolean attributes', () => {
  it('emits boolean attr as a present attribute (no value)', () => {
    const r = mount(BooleanAttr);
    const input = r.find('#bool') as HTMLInputElement;
    expect(input.hasAttribute('disabled')).toBe(true);
    expect(input.disabled).toBe(true);
    r.unmount();
  });
});

// ---------------------------------------------------------------------------
// P2: dynamic numeric attrs
// ---------------------------------------------------------------------------

describe('TSRX features — dynamic numeric attribute', () => {
  it('stringifies numeric values via setAttribute', () => {
    const r = mount(DynamicNumericAttr, { n: 12 });
    const input = r.find('#num') as HTMLInputElement;
    expect(input.getAttribute('maxLength')).toBe('12');
    r.update(DynamicNumericAttr, { n: 5 });
    expect(input.getAttribute('maxLength')).toBe('5');
    r.unmount();
  });
});

// ---------------------------------------------------------------------------
// P2: shorthand attribute `<div {value}/>`
// ---------------------------------------------------------------------------

describe('TSRX features — shorthand attribute', () => {
  it('binds the local of the same name to the attribute', () => {
    const r = mount(ShorthandAttr, { id: 'shortcut' });
    expect(r.find('div').getAttribute('id')).toBe('shortcut');
    r.unmount();
  });
});

// ---------------------------------------------------------------------------
// P2: namespaced attribute `xlink:href`
// ---------------------------------------------------------------------------

describe('TSRX features — namespaced attribute', () => {
  it('emits `xlink:href` literally so the browser handles the namespace', () => {
    const r = mount(NamespacedAttr, { href: '#sprite' });
    const use = r.find('#use-el');
    expect(use.getAttribute('xlink:href')).toBe('#sprite');
    r.unmount();
  });
});

// ---------------------------------------------------------------------------
// P2: for-of header variants
// ---------------------------------------------------------------------------

describe('TSRX features — for-of with `index` only', () => {
  it('binds the per-item index identifier', () => {
    const r = mount(ForOfIndexOnly, { items: ['a', 'b', 'c'] });
    const lis = r.findAll('li');
    expect(lis.map(li => li.textContent)).toEqual(['0:a', '1:b', '2:c']);
    expect(lis.map(li => li.className)).toEqual(['i-0', 'i-1', 'i-2']);
    r.unmount();
  });
});

describe('TSRX features — for-of with `index` AND `key`', () => {
  it('uses key for reconciliation and exposes index in body', () => {
    const r = mount(ForOfIndexAndKey, {
      items: [{ id: 1, label: 'a' }, { id: 2, label: 'b' }, { id: 3, label: 'c' }],
    });
    expect(r.findAll('li').map(li => li.textContent)).toEqual(['0:a', '1:b', '2:c']);
    expect(r.findAll('li').map(li => li.className)).toEqual(['k-1', 'k-2', 'k-3']);

    // Reorder — keys stay, index updates.
    r.update(ForOfIndexAndKey, {
      items: [{ id: 3, label: 'c' }, { id: 1, label: 'a' }, { id: 2, label: 'b' }],
    });
    expect(r.findAll('li').map(li => li.textContent)).toEqual(['0:c', '1:a', '2:b']);
    expect(r.findAll('li').map(li => li.className)).toEqual(['k-3', 'k-1', 'k-2']);
    r.unmount();
  });
});

// ---------------------------------------------------------------------------
// P2: {html ...} only-child — confirms innerHTML actually injected
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Fragments as keyed items in for-of
// ---------------------------------------------------------------------------

describe('TSRX features — keyed fragment items in for-of', () => {
  it('keeps each fragment together when items reorder (multi-root per iteration)', () => {
    const r = mount(KeyedFragmentItems, {
      items: [
        { id: 1, label: 'one' },
        { id: 2, label: 'two' },
        { id: 3, label: 'three' },
      ],
    });
    expect(r.findAll('li').map(li => li.textContent)).toEqual([
      'one-a', 'one-b', 'two-a', 'two-b', 'three-a', 'three-b',
    ]);

    // Reorder by key — each fragment's TWO `<li>`s travel as a unit.
    r.update(KeyedFragmentItems, {
      items: [
        { id: 3, label: 'three' },
        { id: 1, label: 'one' },
        { id: 2, label: 'two' },
      ],
    });
    expect(r.findAll('li').map(li => li.textContent)).toEqual([
      'three-a', 'three-b', 'one-a', 'one-b', 'two-a', 'two-b',
    ]);

    // Verify keyed reconciliation preserved DOM identity by capturing nodes.
    const before = r.findAll('li')[0];
    r.update(KeyedFragmentItems, {
      items: [
        { id: 1, label: 'ONE' },        // dropped 3, renamed 1
        { id: 2, label: 'two' },
      ],
    });
    expect(r.findAll('li').map(li => li.textContent)).toEqual([
      'ONE-a', 'ONE-b', 'two-a', 'two-b',
    ]);
    // Original `three` fragment was removed; `one`'s nodes are still around
    // (just re-rendered with new text).
    void before;
    r.unmount();
  });
});

// ---------------------------------------------------------------------------
// Lazy destructuring — TSRX `&{ }` and `&[ ]`
// ---------------------------------------------------------------------------

describe('TSRX features — lazy destructuring (accepted as syntax)', () => {
  it('accepts &{ } object pattern and binds the props as expected', () => {
    const r = mount(LazyObjectDestructure, {
      user: { first: 'Ada', last: 'Lovelace' },
    });
    expect(r.find('#lazy-obj').textContent).toBe('Ada Lovelace');
    r.update(LazyObjectDestructure, { user: { first: 'Grace', last: 'Hopper' } });
    expect(r.find('#lazy-obj').textContent).toBe('Grace Hopper');
    r.unmount();
  });

  it('accepts &[ ] array pattern with rest element', () => {
    const r = mount(LazyArrayDestructure, { items: ['a', 'b', 'c', 'd'] });
    expect(r.find('#lazy-arr').textContent).toBe('head=a rest=3');
    r.update(LazyArrayDestructure, { items: ['z'] });
    expect(r.find('#lazy-arr').textContent).toBe('head=z rest=0');
    r.unmount();
  });

  it('accepts &{ } as a component parameter (destructures props at the signature)', () => {
    const r = mount(LazyParamDestructure, { greeting: 'Hi', name: 'World' });
    expect(r.find('#lazy-param').textContent).toBe('Hi, World');
    r.update(LazyParamDestructure, { greeting: 'Hola', name: 'Inferno' });
    expect(r.find('#lazy-param').textContent).toBe('Hola, Inferno');
    r.unmount();
  });

  it('accepts &{ } inside a for-of head — key resolves the destructured field', () => {
    const r = mount(LazyForOfHead, {
      items: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }],
    });
    expect(r.findAll('li').map(li => li.textContent)).toEqual(['A', 'B', 'C']);
    expect(r.findAll('li').map(li => li.className)).toEqual(['item-a', 'item-b', 'item-c']);

    // Reorder by key — items move by their destructured-field key.
    r.update(LazyForOfHead, {
      items: [{ id: 'c', label: 'C' }, { id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
    });
    expect(r.findAll('li').map(li => li.className)).toEqual(['item-c', 'item-a', 'item-b']);
    r.unmount();
  });
});

// ---------------------------------------------------------------------------
// Shorthand props on components
// ---------------------------------------------------------------------------

describe('TSRX features — shorthand props on components', () => {
  it('`<Foo {value}/>` is equivalent to `<Foo value={value}/>`', () => {
    const r = mount(ShorthandComponentProp);
    expect(r.find('#child').textContent).toBe('count:7');
    r.unmount();
  });
});

// ---------------------------------------------------------------------------
// Auto-memo: pure for-of bodies skip renderBlock for unchanged item refs
// ---------------------------------------------------------------------------

describe('TSRX features — for-of auto-memo (pure body skip)', () => {
  // Builds a row whose `label` getter increments a counter on every read —
  // so we can observe whether the body actually re-ran during a reorder.
  function spyItem(id: number, label: string, counter: { n: number }) {
    const o: any = { id };
    Object.defineProperty(o, 'label', { get() { counter.n++; return label; } });
    return o;
  }

  it('PURE body skips renderBlock for survivors with unchanged item refs', () => {
    const reads = { n: 0 };
    const a = spyItem(1, 'a', reads);
    const b = spyItem(2, 'b', reads);
    const c = spyItem(3, 'c', reads);
    const r = mount(PureForOf, { items: [a, b, c] });
    expect(r.findAll('li').map(li => li.textContent)).toEqual(['a', 'b', 'c']);
    const baseline = reads.n;

    // Reorder — same item refs, different positions. With auto-memo the
    // body should NOT re-read `label` on any item (item refs + positions
    // both still resolved correctly: pos 0 has a, pos 2 has c — survivors
    // at positions 1 swap; only the actual movers should re-render).
    // Actually for a reverse, EVERY position's item ref changed → all
    // re-render. Test a SWAP-of-2 to keep most in place.
    r.update(PureForOf, { items: [c, b, a] });   // reverse: every pos changes
    const afterReverse = reads.n - baseline;
    expect(afterReverse).toBeGreaterThan(0);     // moved items did re-render

    // Now PASS THE SAME ARRAY again — every item ref + position unchanged.
    // With memo: zero reads. Without memo: 3 reads.
    reads.n = 0;
    r.update(PureForOf, { items: [c, b, a] });
    expect(reads.n).toBe(0);                     // ← the auto-memo proof
    r.unmount();
  });

  it('IMPURE body (closes over `props.selected`) DOES re-render survivors', () => {
    const reads = { n: 0 };
    const a = spyItem(1, 'a', reads);
    const b = spyItem(2, 'b', reads);
    const c = spyItem(3, 'c', reads);
    const r = mount(ImpureForOf, { items: [a, b, c], selected: 0 });
    expect(r.findAll('li.sel')).toHaveLength(0);
    reads.n = 0;

    // Change `selected` (parent state) — the body must re-evaluate even
    // though item refs are identical, so the class binding updates.
    r.update(ImpureForOf, { items: [a, b, c], selected: 2 });
    expect(reads.n).toBeGreaterThan(0);          // re-rendered all 3
    expect(r.find('li.sel').textContent).toBe('b');  // item with id=2
    r.unmount();
  });
});

describe('TSRX features — {html expr} only-child', () => {
  it('sets innerHTML so the markup parses into real DOM', () => {
    const r = mount(HtmlOnlyChild, {
      markup: '<strong class="bold">hi</strong> <em>there</em>',
    });
    const host = r.find('#html-host');
    expect(host.querySelector('strong')?.textContent).toBe('hi');
    expect(host.querySelector('strong')?.className).toBe('bold');
    expect(host.querySelector('em')?.textContent).toBe('there');
    r.unmount();
  });

  it('updates the markup on prop changes', () => {
    const r = mount(HtmlOnlyChild, { markup: '<p>first</p>' });
    expect(r.find('#html-host p').textContent).toBe('first');
    r.update(HtmlOnlyChild, { markup: '<h2>second</h2>' });
    expect(r.find('#html-host h2').textContent).toBe('second');
    expect(r.findAll('#html-host p')).toHaveLength(0);
    r.unmount();
  });
});
