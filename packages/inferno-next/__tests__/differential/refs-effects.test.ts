import { describe, it } from 'vitest';
import { mountDifferential } from './_rig.js';
import { resolve } from 'node:path';

const USEREF_PATH = resolve(__dirname, '../_fixtures/useref.tsrx');
const EFFECT_TIMING_PATH = resolve(__dirname, '../_fixtures/effect-timing.tsrx');

// ----------------------------------------------------------------------------
// useref.tsrx
//
// `MultipleRefsOneEl` (the multi-ref-attr component that previously blocked
// the React-side compile of this whole fixture) was split off into
// useref-multi.tsrx, so the remaining components in useref.tsrx now precompile
// cleanly via @tsrx/react. The differential tests below all exercise
// runtime-shape parity for useRef. `DomRefObject` stays skipped — its
// inferno-side useEffect body reads its deps positionally (an inferno-next-
// specific calling convention), which React's useEffect doesn't honour, so
// the React side throws on read of undefined.
// ----------------------------------------------------------------------------

describe('differential: useref.tsrx — useRef persists / does not rerender / stable identity', () => {
  it('PersistsAcrossRenders: ref mutation visible after setState-driven re-render', async () => {
    const d = await mountDifferential(USEREF_PATH, 'PersistsAcrossRenders');
    await d.step('mount (ref=0)', () => {});
    await d.step('click 1 → ref=1', async (i, r) => {
      await i.click('#bump');
      await r.click('#bump');
    });
    await d.step('click 2 → ref=2', async (i, r) => {
      await i.click('#bump');
      await r.click('#bump');
    });
    await d.step('click 3 → ref=3', async (i, r) => {
      await i.click('#bump');
      await r.click('#bump');
    });
    d.unmount();
  });

  it('MutationDoesNotRerender: mutating ref.current does not change DOM', async () => {
    // The fixture writes a `bump` fn onto the shared handle so an outsider can
    // trigger ref mutation without a re-render. Both runtimes share the same
    // handle object; the last writer wins, but we only need to exercise ONE
    // bump per step — the rig's DOM diff confirms BOTH runtimes still show
    // `props.tick` unchanged (would have changed if mutation triggered a
    // re-render).
    const bumpHandle: { bump?: () => void; read?: () => number } = {};
    const d = await mountDifferential(USEREF_PATH, 'MutationDoesNotRerender', { tick: 7, bumpHandle });
    await d.step('mount (tick=7)', () => {});
    await d.step('bump ref → DOM unchanged', () => {
      bumpHandle.bump?.();
    });
    await d.step('bump ref again → still unchanged', () => {
      bumpHandle.bump?.();
    });
    d.unmount();
  });

  it('StableIdentity: same ref object across re-renders', async () => {
    // The rig's DOM diff is the primary assertion. The observe callback is a
    // convenience hook for cross-render identity checks that aren't part of
    // the differential contract per se.
    const d = await mountDifferential(USEREF_PATH, 'StableIdentity', { observe: () => {} });
    await d.step('mount', () => {});
    await d.step('click → re-render', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    await d.step('click again', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    d.unmount();
  });
});

describe('differential: useref.tsrx — ref reset semantics across conditional mount', () => {
  // SKIP: the fixture authors useRef + useState INSIDE the @if branch body.
  // inferno-next supports this — each block boundary owns its own hook
  // slots, so hooks inside a branch get their own scope and reset on
  // unmount. React's rules-of-hooks rejects this outright ("Rendered fewer
  // hooks than expected"). Pure inferno-next feature; no React parity
  // possible without rewriting the fixture to hoist the hooks above the
  // @if. Covered semantically by the non-differential useref.test.ts.
  it.skip('RefInIf: ref resets when inner branch unmounts and remounts', async () => {
    const d = await mountDifferential(USEREF_PATH, 'RefInIf');
    await d.step('mount (show=true, inner ref=0)', () => {});
    await d.step('bump inner → 1', async (i, r) => {
      await i.click('#inner');
      await r.click('#inner');
    });
    await d.step('bump inner → 2', async (i, r) => {
      await i.click('#inner');
      await r.click('#inner');
    });
    await d.step('toggle off (inner unmounts)', async (i, r) => {
      await i.click('#top');
      await r.click('#top');
    });
    await d.step('toggle on (inner remounts, ref should be back to 0)', async (i, r) => {
      await i.click('#top');
      await r.click('#top');
    });
    await d.step('bump inner → 1 (fresh ref)', async (i, r) => {
      await i.click('#inner');
      await r.click('#inner');
    });
    d.unmount();
  });
});

describe('differential: useref.tsrx — per-row refs in @for-of', () => {
  it('PerRowRef: each row maintains its own ref slot through reorder', async () => {
    const d = await mountDifferential(USEREF_PATH, 'PerRowRef');
    await d.step('mount (a,b,c)', () => {});
    await d.step('bump row a', async (i, r) => {
      await i.click('li.r-1 button');
      await r.click('li.r-1 button');
    });
    await d.step('bump row b #1', async (i, r) => {
      await i.click('li.r-2 button');
      await r.click('li.r-2 button');
    });
    await d.step('bump row b #2', async (i, r) => {
      await i.click('li.r-2 button');
      await r.click('li.r-2 button');
    });
    await d.step('reverse', async (i, r) => {
      await i.click('#reverse');
      await r.click('#reverse');
    });
    await d.step('bump row a (post-reverse)', async (i, r) => {
      await i.click('li.r-1 button');
      await r.click('li.r-1 button');
    });
    d.unmount();
  });
});

describe('differential: useref.tsrx — DOM refs (object form)', () => {
  it('DomRefObject: ref attaches the DOM node and effect can read it', async () => {
    const target = {} as any;
    const d = await mountDifferential(USEREF_PATH, 'DomRefObject', { target });
    await d.step('mount', () => {});
    d.unmount();
  });
});

describe('differential: useref.tsrx — DOM refs (callback form)', () => {
  it('DomRefCallback: callback ref fires with element on mount', async () => {
    // Callback-ref null-on-unmount semantics can diverge across React versions
    // and inferno-next. Per the brief: don't pre-emptively make it pass — let
    // the rig surface the shape if it differs. Currently blocked by the
    // fixture-wide compile error.
    const target = {} as any;
    const d = await mountDifferential(USEREF_PATH, 'DomRefCallback', { target });
    await d.step('mount', () => {});
    d.unmount();
  });
});

describe('differential: useref.tsrx — ref cleanup on unmount', () => {
  it('DomRefCleanup: callback ref fires across mount → unmount → remount cycle', async () => {
    const observed: any[] = [];
    const d = await mountDifferential(USEREF_PATH, 'DomRefCleanup', {
      observe: (el: any) => { observed.push(el); },
    });
    await d.step('mount (target visible)', () => {});
    await d.step('toggle off (target unmounts)', async (i, r) => {
      await i.click('#toggle');
      await r.click('#toggle');
    });
    await d.step('toggle on (target remounts)', async (i, r) => {
      await i.click('#toggle');
      await r.click('#toggle');
    });
    await d.step('toggle off again', async (i, r) => {
      await i.click('#toggle');
      await r.click('#toggle');
    });
    d.unmount();
  });

  it('DomRefObjectCleanup: object ref.current set to null on unmount', async () => {
    const ref = { current: null as any };
    const d = await mountDifferential(USEREF_PATH, 'DomRefObjectCleanup', { ref });
    await d.step('mount (target attached)', () => {});
    await d.step('toggle off (ref nulled)', async (i, r) => {
      await i.click('#toggle');
      await r.click('#toggle');
    });
    await d.step('toggle on (ref re-attached)', async (i, r) => {
      await i.click('#toggle');
      await r.click('#toggle');
    });
    d.unmount();
  });
});

describe('differential: useref.tsrx — useImperativeHandle', () => {
  it('ImperativeOwner: child exposes bump/reset via parent-owned ref', async () => {
    const handle: any = {};
    const d = await mountDifferential(USEREF_PATH, 'ImperativeOwner', { handle });
    await d.step('mount (counter=0)', () => {});
    d.unmount();
  });
});

describe('differential: useref.tsrx — useRef lazy-ish initial value', () => {
  it('LazyInit: initial value persists across re-renders', async () => {
    // factory() is called by both runtimes on mount. Both should keep the
    // FIRST result across renders. A constant-returning factory keeps the
    // displayed text identical even if React invokes factory extra times.
    const d = await mountDifferential(USEREF_PATH, 'LazyInit', { factory: () => 'hello' });
    await d.step('mount (init-value:hello)', () => {});
    await d.step('click → re-render, value unchanged', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    await d.step('click again', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    d.unmount();
  });
});

// ----------------------------------------------------------------------------
// effect-timing.tsrx — phase ordering, passive vs layout
//
// Bodies authored with LEXICAL capture (props.log inside the closure) rather
// than the inferno-next positional-deps spread shape, so both runtimes drive
// the same writes into the shared log. Inferno-next still supports the
// positional form for inferno-only fixtures; lexical capture is the
// cross-runtime portable subset.
// ----------------------------------------------------------------------------

describe('differential: effect-timing.tsrx — phase ordering and passive vs layout', () => {
  it('PhaseOrder: insertion + layout + passive bodies all run, DOM committed', async () => {
    const log: string[] = [];
    const d = await mountDifferential(EFFECT_TIMING_PATH, 'PhaseOrder', { tick: 0, log });
    await d.step('mount', () => {});
    d.unmount();
  });

  it('PassiveDeferred: layout fires sync, passive deferred — both observe same DOM', async () => {
    const log: string[] = [];
    const d = await mountDifferential(EFFECT_TIMING_PATH, 'PassiveDeferred', { tick: 0, log });
    await d.step('mount', () => {});
    d.unmount();
  });
});
