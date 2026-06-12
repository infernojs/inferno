import { describe, it } from 'vitest';
import { mountDifferential } from './_rig.js';
import { resolve } from 'node:path';

const USEREF_PATH = resolve(__dirname, '../_fixtures/useref.tsrx');
const EFFECT_TIMING_PATH = resolve(__dirname, '../_fixtures/effect-timing.tsrx');

// ----------------------------------------------------------------------------
// useref.tsrx
//
// NOTE: the entire useref.tsrx fixture currently fails to precompile via
// @tsrx/react because it contains `MultipleRefsOneEl` (two `ref=` attrs on the
// same element), which @tsrx/react rejects fixture-wide:
//   "Element has multiple `ref={...}` attributes; an element may have at most
//    one. Use a single array-valued ref such as `ref={[a, b]}` …"
//
// Because the React-side compile fails fixture-wide, NONE of the React exports
// are available at differential-mount time. We mark the useref tests below as
// `it.skip` so they're discoverable but don't poison the suite while that
// compile blocker stands. Re-enable once either (a) MultipleRefsOneEl is moved
// to a separate fixture, or (b) @tsrx/react learns to skip the offending
// component and emit the rest.
// ----------------------------------------------------------------------------

describe('differential: useref.tsrx — useRef persists / does not rerender / stable identity', () => {
  it.skip('PersistsAcrossRenders: ref mutation visible after setState-driven re-render', async () => {
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

  it.skip('MutationDoesNotRerender: mutating ref.current does not change DOM', async () => {
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

  it.skip('StableIdentity: same ref object across re-renders', async () => {
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
  it.skip('PerRowRef: each row maintains its own ref slot through reorder', async () => {
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
  it.skip('DomRefObject: ref attaches the DOM node and effect can read it', async () => {
    // Effect bodies in inferno-next receive their deps positionally; React's
    // useEffect does not. The fixture's body reads `target` and `refSlot`
    // from positional args, so the React side will throw at runtime (separate
    // failure mode from the compile-wide skip above — would only surface
    // once the multi-ref blocker is fixed).
    const target = {} as any;
    const d = await mountDifferential(USEREF_PATH, 'DomRefObject', { target });
    await d.step('mount', () => {});
    d.unmount();
  });
});

describe('differential: useref.tsrx — DOM refs (callback form)', () => {
  it.skip('DomRefCallback: callback ref fires with element on mount', async () => {
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
  it.skip('DomRefCleanup: callback ref fires across mount → unmount → remount cycle', async () => {
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

  it.skip('DomRefObjectCleanup: object ref.current set to null on unmount', async () => {
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
  it.skip('ImperativeOwner: child exposes bump/reset via parent-owned ref', async () => {
    const handle: any = {};
    const d = await mountDifferential(USEREF_PATH, 'ImperativeOwner', { handle });
    await d.step('mount (counter=0)', () => {});
    d.unmount();
  });
});

describe('differential: useref.tsrx — useRef lazy-ish initial value', () => {
  it.skip('LazyInit: initial value persists across re-renders', async () => {
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
// effect-timing.tsrx
//
// NOTE: every component in effect-timing.tsrx authors useEffect /
// useLayoutEffect / useInsertionEffect bodies that accept their deps as
// POSITIONAL arguments (an inferno-next-specific calling convention — the
// runtime spreads `deps` into the effect body call). The React side compiles
// fine, but at runtime React calls the body with NO arguments, so the bodies
// throw `Cannot read properties of undefined (reading 'push')` immediately.
//
// This is a compile-emission divergence between the two pipelines, not a
// renderer-semantics divergence — and it makes the fixture unusable for
// differential testing as authored. Skipping until the fixture is rewritten
// to close over the props via lexical capture instead of positional deps.
// ----------------------------------------------------------------------------

describe('differential: effect-timing.tsrx — phase ordering and passive vs layout', () => {
  it.skip('PhaseOrder: insertion + layout + passive bodies all run, DOM committed', async () => {
    const log: string[] = [];
    const d = await mountDifferential(EFFECT_TIMING_PATH, 'PhaseOrder', { tick: 0, log });
    await d.step('mount', () => {});
    d.unmount();
  });

  it.skip('PassiveDeferred: layout fires sync, passive deferred — both observe same DOM', async () => {
    const log: string[] = [];
    const d = await mountDifferential(EFFECT_TIMING_PATH, 'PassiveDeferred', { tick: 0, log });
    await d.step('mount', () => {});
    d.unmount();
  });
});
