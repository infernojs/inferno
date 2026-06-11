import { describe, it, expect } from 'vitest';
import { mount } from './_helpers';
import { Red, Blue, Pick, Toggle } from './_fixtures/dynamic.tsrx';

describe('Dynamic', () => {
  it('renders the component passed via `is`', () => {
    const r = mount(Pick, { is: Red, label: 'hi' });
    expect(r.findAll('.leaf')).toHaveLength(1);
    expect(r.find('.leaf').classList.contains('red')).toBe(true);
    expect(r.find('.leaf').textContent).toBe('red:hi');
    r.unmount();
  });

  it('forwards every prop except `is`', () => {
    const r = mount(Pick, { is: Blue, label: 'world' });
    expect(r.find('.leaf').classList.contains('blue')).toBe(true);
    expect(r.find('.leaf').textContent).toBe('blue:world');
    r.unmount();
  });

  it('swapping `is` re-mounts under the same slot', () => {
    const r = mount(Pick, { is: Red, label: 'a' });
    expect(r.find('.leaf').classList.contains('red')).toBe(true);
    r.update(Pick, { is: Blue, label: 'a' });
    expect(r.findAll('.leaf')).toHaveLength(1);                  // still exactly one mounted
    expect(r.find('.leaf').classList.contains('blue')).toBe(true);
    expect(r.find('.leaf').textContent).toBe('blue:a');
    r.unmount();
  });

  it('state-driven toggle swaps components in place', () => {
    const r = mount(Toggle);
    expect(r.find('.leaf').classList.contains('red')).toBe(true);
    expect(r.find('.leaf').textContent).toBe('red:ok');
    r.click('#swap');
    expect(r.find('.leaf').classList.contains('blue')).toBe(true);
    expect(r.find('.leaf').textContent).toBe('blue:ok');
    r.click('#swap');
    expect(r.find('.leaf').classList.contains('red')).toBe(true);
    r.unmount();
  });
});
