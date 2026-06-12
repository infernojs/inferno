import { describe, it } from 'vitest';
import { mountDifferential } from './_rig.js';
import { resolve } from 'node:path';

// Differential pin for the source-order anchor fix applied to forBlock,
// ifBlock, switchBlock, and tryBlock. Each block type now emits a `<!>`
// placeholder at its source-order index when it appears inside a mixed-
// children parent; the runtime insertBefore's the slot's start/end
// markers there instead of appending. These tests prove every variant
// matches React's source-order DOM exactly.

const FIXTURE = resolve(__dirname, '../_fixtures/anchor-order.tsrx');

describe('differential: anchor-order.tsrx — forBlock source order', () => {
  it('forBeforeSibling: items render BEFORE the static .after sibling', async () => {
    const d = await mountDifferential(FIXTURE, 'forBeforeSibling', {
      items: [
        { id: 1, label: 'a' },
        { id: 2, label: 'b' },
        { id: 3, label: 'c' },
      ],
    });
    await d.step('mount (3 items, then .after)', () => {});
    d.unmount();
  });

  it('forBeforeSibling: empty @for still leaves .after in place', async () => {
    const d = await mountDifferential(FIXTURE, 'forBeforeSibling', { items: [] });
    await d.step('mount empty', () => {});
    d.unmount();
  });

  it('forBetweenSiblings: prepend/append/clear keeps items between siblings', async () => {
    const d = await mountDifferential(FIXTURE, 'forBetweenSiblings');
    await d.step('mount (head, a, b, tail)', () => {});
    await d.step('prepend → (head, z, a, b, tail)', async (i, r) => {
      await i.click('#prepend');
      await r.click('#prepend');
    });
    await d.step('append → grows tail', async (i, r) => {
      await i.click('#append');
      await r.click('#append');
    });
    await d.step('clear → (head, tail) only', async (i, r) => {
      await i.click('#clear');
      await r.click('#clear');
    });
    d.unmount();
  });
});

describe('differential: anchor-order.tsrx — ifBlock source order', () => {
  it('ifBeforeSibling show=true: then-branch precedes .after', async () => {
    const d = await mountDifferential(FIXTURE, 'ifBeforeSibling', { show: true });
    await d.step('mount then-branch', () => {});
    d.unmount();
  });

  it('ifBeforeSibling show=false: else-branch precedes .after', async () => {
    const d = await mountDifferential(FIXTURE, 'ifBeforeSibling', { show: false });
    await d.step('mount else-branch', () => {});
    d.unmount();
  });

  it('ifBeforeSiblingToggle: branch swap preserves anchor position', async () => {
    const d = await mountDifferential(FIXTURE, 'ifBeforeSiblingToggle');
    await d.step('mount (then)', () => {});
    await d.step('toggle → else', async (i, r) => {
      await i.click('#toggle');
      await r.click('#toggle');
    });
    await d.step('toggle → then', async (i, r) => {
      await i.click('#toggle');
      await r.click('#toggle');
    });
    d.unmount();
  });
});

describe('differential: anchor-order.tsrx — switchBlock source order', () => {
  it('switchBeforeSibling: case A between lead and mid/tail', async () => {
    const d = await mountDifferential(FIXTURE, 'switchBeforeSibling', { kind: 'a' });
    await d.step('mount kind=a', () => {});
    d.unmount();
  });

  it('switchBeforeSibling: case B between lead and mid/tail', async () => {
    const d = await mountDifferential(FIXTURE, 'switchBeforeSibling', { kind: 'b' });
    await d.step('mount kind=b', () => {});
    d.unmount();
  });

  it('switchBeforeSibling: default branch between lead and mid/tail', async () => {
    const d = await mountDifferential(FIXTURE, 'switchBeforeSibling', { kind: 'zzz' });
    await d.step('mount kind=zzz', () => {});
    d.unmount();
  });

  it('switchFirstChild: @switch as first child precedes static siblings', async () => {
    const d = await mountDifferential(FIXTURE, 'switchFirstChild', { kind: 'a' });
    await d.step('mount kind=a', () => {});
    d.unmount();
  });

  it('switchCycle: cycling discriminant keeps case between BEFORE / bump / AFTER', async () => {
    const d = await mountDifferential(FIXTURE, 'switchCycle');
    await d.step('mount n=0', () => {});
    await d.step('bump → n=1', async (i, r) => {
      await i.click('#bump');
      await r.click('#bump');
    });
    await d.step('bump → n=2', async (i, r) => {
      await i.click('#bump');
      await r.click('#bump');
    });
    await d.step('bump → n=3 (wraps)', async (i, r) => {
      await i.click('#bump');
      await r.click('#bump');
    });
    d.unmount();
  });
});

describe('differential: anchor-order.tsrx — tryBlock source order', () => {
  // We only diff the inferno-side render here; cross-runtime DOM diff for
  // @try is gated on @tsrx/react's @try lowering (see suspense-basics
  // proposal in the audit). The fixture is still picked up by the
  // differential rig — if @tsrx/react can't render it, that's a precompile
  // failure surfaced at mountDifferential time and we'll see it as a SKIP
  // rather than a silent miss.
  it('tryBeforeSibling: try-body precedes .after sibling', async () => {
    const d = await mountDifferential(FIXTURE, 'tryBeforeSibling', { initialThrow: false });
    await d.step('mount (try ok)', () => {});
    d.unmount();
  });

  it('tryBeforeSibling: catch branch preserves source order on throw', async () => {
    const d = await mountDifferential(FIXTURE, 'tryBeforeSibling', { initialThrow: false });
    await d.step('mount (try ok)', () => {});
    // Toggling makes the child Thrower throw during its render — inferno-next's
    // tryBlock catches it via tryHelper, and the React side's TsrxErrorBoundary
    // (lowered by @tsrx/react from @catch) catches via getDerivedStateFromError.
    // Both renderers swap the @catch body into the SAME slot, so the .after
    // sibling stays in source-order position.
    await d.step('toggle → throw → catch shown before .after', async (i, r) => {
      await i.click('#toggle');
      await r.click('#toggle');
    });
    // The catch's reset button calls `reset(); setThrowIt(false);` in the
    // same handler. React's TsrxErrorBoundary clears `state.error` and then
    // batches with setThrowIt → one commit, try body restored. Inferno-next's
    // requestReset rewinds slot state (branch=-1, err=null) and schedules
    // the parent — sibling setState batches in the same commit, so when
    // mountTry re-runs the body it sees throwIt=false and doesn't re-throw.
    await d.step('reset → try body restored before .after', async (i, r) => {
      await i.click('#reset');
      await r.click('#reset');
    });
    d.unmount();
  });
});
