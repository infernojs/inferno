import { describe, it, expect } from 'vitest';
import { mount } from './_helpers';
import { Red, Blue, PickTag, ToggleTag, PickMember } from './_fixtures/dynamic-tag.tsrx';

describe('<{expr}> dynamic tag', () => {
  it('renders the component picked via expression', () => {
    const r = mount(PickTag, { comp: Red, label: 'hi' });
    expect(r.findAll('.leaf')).toHaveLength(1);
    expect(r.find('.leaf').classList.contains('red')).toBe(true);
    expect(r.find('.leaf').textContent).toBe('red:hi');
    r.unmount();
  });

  it('forwards every prop except the component expression', () => {
    const r = mount(PickTag, { comp: Blue, label: 'world' });
    expect(r.find('.leaf').classList.contains('blue')).toBe(true);
    expect(r.find('.leaf').textContent).toBe('blue:world');
    r.unmount();
  });

  it('swapping the expression re-mounts under the same slot', () => {
    const r = mount(PickTag, { comp: Red, label: 'a' });
    expect(r.find('.leaf').classList.contains('red')).toBe(true);
    r.update(PickTag, { comp: Blue, label: 'a' });
    expect(r.findAll('.leaf')).toHaveLength(1);                  // still exactly one mounted
    expect(r.find('.leaf').classList.contains('blue')).toBe(true);
    expect(r.find('.leaf').textContent).toBe('blue:a');
    r.unmount();
  });

  it('state-driven toggle swaps components in place', () => {
    const r = mount(ToggleTag);
    expect(r.find('.leaf').classList.contains('red')).toBe(true);
    expect(r.find('.leaf').textContent).toBe('red:ok');
    r.click('#swap');
    expect(r.find('.leaf').classList.contains('blue')).toBe(true);
    expect(r.find('.leaf').textContent).toBe('blue:ok');
    r.click('#swap');
    expect(r.find('.leaf').classList.contains('red')).toBe(true);
    r.unmount();
  });

  it('resolves a member expression inside <{expr}>', () => {
    const r = mount(PickMember, { lib: { Red, Blue } });
    expect(r.find('.leaf').classList.contains('red')).toBe(true);
    expect(r.find('.leaf').textContent).toBe('red:member');
    r.unmount();
  });
});
