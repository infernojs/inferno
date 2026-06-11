import { describe, it, expect, vi } from 'vitest';
import { mount, nextPaint } from './_helpers';
import {
  LazyInit, TwoStates, Tally, MemoTest, CbTest, RefTest,
  EffectMount, EffectDeps, LayoutVsEffect,
} from './_fixtures/hooks.tsrx';

describe('useState', () => {
  it('runs lazy initializer once', () => {
    const r = mount(LazyInit);
    expect(r.find('span').textContent).toBe('42');
    r.unmount();
  });

  it('isolates separate slots', () => {
    const r = mount(TwoStates);
    expect(r.find('#a').textContent).toBe('1');
    expect(r.find('#b').textContent).toBe('10');
    r.click('#a');
    expect(r.find('#a').textContent).toBe('2');
    expect(r.find('#b').textContent).toBe('10');
    r.click('#b'); r.click('#b');
    expect(r.find('#a').textContent).toBe('2');
    expect(r.find('#b').textContent).toBe('14');
    r.unmount();
  });
});

describe('useReducer', () => {
  it('dispatches actions', () => {
    const r = mount(Tally);
    expect(r.find('button').textContent).toBe('0');
    r.click('button'); r.click('button');
    expect(r.find('button').textContent).toBe('10');
    r.unmount();
  });
});

describe('useMemo', () => {
  it('recomputes only when deps change', () => {
    const r = mount(MemoTest, { n: 3 });
    expect(r.find('.val').textContent).toBe('6');
    expect(r.find('.count').textContent).toBe('1');
    // same props → no recompute
    r.update(MemoTest, { n: 3 });
    expect(r.find('.val').textContent).toBe('6');
    expect(r.find('.count').textContent).toBe('1');
    // props change → recompute
    r.update(MemoTest, { n: 5 });
    expect(r.find('.val').textContent).toBe('10');
    expect(r.find('.count').textContent).toBe('2');
    r.unmount();
  });
});

describe('useCallback', () => {
  it('value passed through useCallback is preserved across renders', () => {
    // Identity stability and dep tracking live in callbacks.test.ts via
    // CallbackIdentity. Here we just smoke-test the basic shape: a useCallback
    // declared in a component body renders successfully AND its identity
    // closes over the dep-array prop (label propagates to the span).
    const r = mount(CbTest, { label: 'hi' });
    expect(r.find('span').textContent).toBe('hi');
    r.update(CbTest, { label: 'bye' });
    expect(r.find('span').textContent).toBe('bye');
    r.unmount();
  });
});

describe('useRef', () => {
  it('survives across renders, mutation does not retrigger', () => {
    const r = mount(RefTest);
    expect(r.find('button').textContent).toBe('0');
    r.click('button');
    expect(r.find('button').textContent).toBe('1');
    r.click('button');
    expect(r.find('button').textContent).toBe('2');
    r.unmount();
  });
});

describe('useEffect', () => {
  it('fires once after mount, fires cleanup on unmount', async () => {
    const onMount = vi.fn();
    const onUnmount = vi.fn();
    const r = mount(EffectMount, { onMount, onUnmount });
    // passive effects fire after paint; wait
    await nextPaint();
    expect(onMount).toHaveBeenCalledTimes(1);
    expect(onUnmount).toHaveBeenCalledTimes(0);
    r.unmount();
    expect(onUnmount).toHaveBeenCalledTimes(1);
  });

  it('re-fires when deps change', async () => {
    const cb = vi.fn();
    const r = mount(EffectDeps, { cb, n: 1 });
    await nextPaint();
    expect(cb).toHaveBeenLastCalledWith(1);
    expect(cb).toHaveBeenCalledTimes(1);
    r.update(EffectDeps, { cb, n: 1 });
    await nextPaint();
    expect(cb).toHaveBeenCalledTimes(1);    // unchanged deps
    r.update(EffectDeps, { cb, n: 2 });
    await nextPaint();
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenLastCalledWith(2);
    r.unmount();
  });
});

describe('three-phase effect pipeline', () => {
  it('insertion before layout before passive', async () => {
    const order: string[] = [];
    const r = mount(LayoutVsEffect, { order });
    // insertion + layout fire synchronously during commit
    expect(order).toEqual(['i', 'l']);
    await nextPaint();
    expect(order).toEqual(['i', 'l', 'e']);
    r.unmount();
  });
});
