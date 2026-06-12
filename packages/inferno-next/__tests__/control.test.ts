import { describe, it, expect } from 'vitest';
import { mount } from './_helpers';
import { Toggle, IfOnly, HookInIf, IdInComponent, IfTrailingText, ForTrailingText, WhitespaceInIf } from './_fixtures/control.tsrx';

describe('ifBlock', () => {
  it('swaps then/else branches', () => {
    const r = mount(Toggle);
    expect(r.findAll('.shown')).toHaveLength(0);
    expect(r.findAll('.hidden')).toHaveLength(1);
    r.click('button');
    expect(r.findAll('.shown')).toHaveLength(1);
    expect(r.findAll('.hidden')).toHaveLength(0);
    r.click('button');
    expect(r.findAll('.shown')).toHaveLength(0);
    expect(r.findAll('.hidden')).toHaveLength(1);
    r.unmount();
  });

  it('handles if without else (mount + unmount nothing on false)', () => {
    const r = mount(IfOnly);
    expect(r.findAll('.maybe')).toHaveLength(0);
    r.click('button');
    expect(r.findAll('.maybe')).toHaveLength(1);
    r.click('button');
    expect(r.findAll('.maybe')).toHaveLength(0);
    r.unmount();
  });

  it('hooks inside if-branch reset when branch unmounts (Block boundary)', () => {
    const r = mount(HookInIf);
    expect(r.find('#inner').textContent).toBe('0');
    r.click('#inner');
    r.click('#inner');
    expect(r.find('#inner').textContent).toBe('2');
    r.click('#top');  // hide
    expect(r.findAll('#inner')).toHaveLength(0);
    r.click('#top');  // show again — fresh state
    expect(r.find('#inner').textContent).toBe('0');
    r.unmount();
  });
});

describe('useId', () => {
  it('produces a stable id for the component', () => {
    const r = mount(IdInComponent);
    const id1 = r.find('label').getAttribute('for');
    expect(id1).toMatch(/^:in-[a-z0-9]+:$/);
    expect(r.find('label').textContent).toBe(id1!);
    r.unmount();
  });

  it('produces distinct ids across separate components', () => {
    const r1 = mount(IdInComponent);
    const r2 = mount(IdInComponent);
    expect(r1.find('label').getAttribute('for')).not.toBe(r2.find('label').getAttribute('for'));
    r1.unmount(); r2.unmount();
  });
});

// Pins for tsrx 0.1.29 parser fixes (regression coverage).
describe('parser fixes (tsrx 0.1.29)', () => {
  it('IfTrailingText: text after @if {} closing brace is rendered', () => {
    const r = mount(IfTrailingText, { show: true });
    const p = r.find('p');
    // span.gated must render; the trailing text " trailing!" must follow.
    expect(p.querySelector('.gated')?.textContent).toBe('yes');
    expect(p.textContent).toContain('trailing!');
    r.unmount();
  });

  it('IfTrailingText: trailing text survives when @if branch is empty', () => {
    const r = mount(IfTrailingText, { show: false });
    expect(r.find('p').textContent).toContain('trailing!');
    expect(r.findAll('.gated')).toHaveLength(0);
    r.unmount();
  });

  it('ForTrailingText: text after @for {} closing brace is rendered', () => {
    const r = mount(ForTrailingText, { items: ['a', 'b'] });
    const p = r.find('p');
    const rows = Array.from(p.querySelectorAll('.row')) as HTMLElement[];
    expect(rows.map(r => r.textContent)).toEqual(['a', 'b']);
    expect(p.textContent).toContain('tail');
    r.unmount();
  });

  it('WhitespaceInIf: `as string` inside an @if body does not leak into compiled JS', () => {
    // The pin is COMPILE-TIME — the fixture loading at all proves the
    // stripTsOnlyWrappers pass works. Without the fix, rolldown rejects the
    // emitted `'  spaced  ' as string;` with "Type assertion expressions can
    // only be used in TypeScript files." Body renders nothing today (an
    // expression-statement at @if body position is not lifted into a JSX
    // child by current normalize semantics — separate parser-semantics
    // ticket, tsrx d14ec84f).
    const r = mount(WhitespaceInIf, { show: true });
    r.unmount();
  });

});
