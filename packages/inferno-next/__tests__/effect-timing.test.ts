import { describe, it, expect, vi } from 'vitest';
import { mount, nextPaint } from './_helpers';
import { PhaseOrder, LayoutReadsDom, PassiveDeferred, ManyPassiveEffects } from './_fixtures/effect-timing.tsrx';

describe('effect timing', () => {
  it('phase order on mount: insertion → layout (sync) → passive (post-paint)', async () => {
    const log: string[] = [];
    const r = mount(PhaseOrder, { tick: 0, log });
    // insertion + layout fire synchronously during commit (inside mount's flushSync).
    expect(log).toEqual(['ins:body', 'lay:body']);
    // passive deferred until after paint.
    await nextPaint();
    expect(log).toEqual(['ins:body', 'lay:body', 'eff:body']);
    r.unmount();
  });

  it('phase order on re-render: cleanups fire before bodies of same phase', async () => {
    const log: string[] = [];
    const r = mount(PhaseOrder, { tick: 0, log });
    await nextPaint();
    log.length = 0;                          // clear mount log
    r.update(PhaseOrder, { tick: 1, log });
    // After update: insertion cleanup → insertion body → layout cleanup → layout body.
    expect(log).toEqual(['ins:cleanup', 'ins:body', 'lay:cleanup', 'lay:body']);
    await nextPaint();
    // Then passive cleanup → passive body.
    expect(log).toEqual([
      'ins:cleanup', 'ins:body',
      'lay:cleanup', 'lay:body',
      'eff:cleanup', 'eff:body',
    ]);
    r.unmount();
  });

  it('all phases fire cleanup on unmount in reverse-mount order', async () => {
    // Cleanups fire in REVERSE-mount order to match React's per-fiber
    // finalizer walk: the LAST effect to register (here useEffect, in the
    // passive phase) has its cleanup run first. Since the PhaseOrder fixture
    // declares useEffect → useLayoutEffect → useInsertionEffect in source
    // order, and the cleanups array is populated in execution order
    // (insertion → layout → passive), unwinding in reverse yields
    // passive → layout → insertion. Same order as React.
    const log: string[] = [];
    const r = mount(PhaseOrder, { tick: 0, log });
    await nextPaint();
    log.length = 0;
    r.unmount();
    expect(log).toEqual(['eff:cleanup', 'lay:cleanup', 'ins:cleanup']);
  });

  it('useLayoutEffect can read the committed DOM synchronously', () => {
    const onCommit = vi.fn();
    const r = mount(LayoutReadsDom, { onCommit });
    expect(onCommit).toHaveBeenCalledTimes(1);
    const html = onCommit.mock.calls[0][0];
    expect(html).toContain('id="measured"');
    expect(html).toContain('A');
    r.unmount();
  });

  it('flushSync drains insertion+layout but NOT passive', async () => {
    const log: string[] = [];
    const r = mount(PassiveDeferred, { tick: 0, log });
    // flushSync (used by mount) drained layout but not passive.
    expect(log).toEqual(['layout']);
    await nextPaint();
    expect(log).toEqual(['layout', 'passive']);
    r.unmount();
  });

  it('within a single phase, cleanups fire in REVERSE-mount order on unmount', async () => {
    // Mirrors React's per-fiber unmount-cleanup contract: when a component
    // declares multiple effects within the SAME phase (here, three
    // useEffects), unmounting fires their cleanup functions in the REVERSE
    // of their registration order — last-declared cleanup runs first. This
    // matches React's depth-first finalizer walk over the fiber's effect
    // chain and lets later effects depend on resources set up by earlier
    // ones without racing the cleanup teardown.
    const log: string[] = [];
    const r = mount(ManyPassiveEffects, { log });
    await nextPaint();
    expect(log).toEqual(['A:body', 'B:body', 'C:body']);

    log.length = 0;
    r.unmount();
    expect(log).toEqual(['C:cleanup', 'B:cleanup', 'A:cleanup']);
  });
});
