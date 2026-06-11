import { describe, it, expect } from 'vitest';
import { mount } from './_helpers';
import { PickKind, Cycle, NoDefault, HookInCase } from './_fixtures/switch.tsrx';

describe('switchBlock', () => {
  it('picks the first matching @case', () => {
    const r = mount(PickKind, { kind: 'a' });
    expect(r.findAll('.pick')).toHaveLength(1);
    expect(r.find('.pick').getAttribute('data-kind')).toBe('a');
    expect(r.find('.pick').textContent).toBe('A');
    r.unmount();
  });

  it('falls back to @default when no @case matches', () => {
    const r = mount(PickKind, { kind: 'nope' });
    expect(r.findAll('.pick')).toHaveLength(1);
    expect(r.find('.pick').getAttribute('data-kind')).toBe('other');
    expect(r.find('.pick').textContent).toBe('D');
    r.unmount();
  });

  it('swaps branches when discriminant changes', () => {
    const r = mount(PickKind, { kind: 'a' });
    expect(r.find('.pick').getAttribute('data-kind')).toBe('a');
    r.update(PickKind, { kind: 'b' });
    expect(r.findAll('.pick')).toHaveLength(1);
    expect(r.find('.pick').getAttribute('data-kind')).toBe('b');
    expect(r.find('.pick').textContent).toBe('B');
    r.update(PickKind, { kind: 'nope' });
    expect(r.find('.pick').getAttribute('data-kind')).toBe('other');
    r.unmount();
  });

  it('state-driven case cycling: each tick mounts the next branch and unmounts the previous', () => {
    const r = mount(Cycle);
    expect(r.find('.out').getAttribute('data-step')).toBe('0');
    expect(r.find('.out').textContent).toBe('zero');
    r.click('#bump');
    expect(r.findAll('.out')).toHaveLength(1);
    expect(r.find('.out').getAttribute('data-step')).toBe('1');
    expect(r.find('.out').textContent).toBe('one');
    r.click('#bump');
    expect(r.find('.out').getAttribute('data-step')).toBe('2');
    expect(r.find('.out').textContent).toBe('two');
    r.click('#bump');
    // n=3 → 3 % 3 = 0, back to first case
    expect(r.find('.out').getAttribute('data-step')).toBe('0');
    r.unmount();
  });

  it('renders nothing when no case matches AND there is no @default', () => {
    const r = mount(NoDefault, { kind: 'hide' });
    expect(r.findAll('.before')).toHaveLength(1);
    expect(r.findAll('.maybe')).toHaveLength(0);
    expect(r.findAll('.after')).toHaveLength(1);
    r.update(NoDefault, { kind: 'show' });
    expect(r.findAll('.maybe')).toHaveLength(1);
    r.update(NoDefault, { kind: 'hide' });
    expect(r.findAll('.maybe')).toHaveLength(0);
    r.unmount();
  });

  it('case-local hooks reset when the selected case changes (Block boundary)', () => {
    const r = mount(HookInCase);
    expect(r.find('#inc-a').textContent).toBe('a:0');
    r.click('#inc-a');
    r.click('#inc-a');
    expect(r.find('#inc-a').textContent).toBe('a:2');
    r.click('#swap');                                     // switch to y branch
    expect(r.findAll('#inc-a')).toHaveLength(0);
    expect(r.find('#inc-b').textContent).toBe('b:0');     // fresh hook state
    r.click('#inc-b');
    expect(r.find('#inc-b').textContent).toBe('b:10');
    r.click('#swap');                                     // back to x — fresh again
    expect(r.find('#inc-a').textContent).toBe('a:0');
    r.unmount();
  });
});
