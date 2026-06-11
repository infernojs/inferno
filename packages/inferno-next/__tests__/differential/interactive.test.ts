import { describe, it } from 'vitest';
import { mountDifferential } from './_rig.js';
import { resolve } from 'node:path';

const ATTRS_EVENTS = resolve(__dirname, '../_fixtures/attrs-events.tsrx');
const HOOKS = resolve(__dirname, '../_fixtures/hooks.tsrx');
const CONTROL = resolve(__dirname, '../_fixtures/control.tsrx');
const FOR = resolve(__dirname, '../_fixtures/for.tsrx');
const FRAGMENTS = resolve(__dirname, '../_fixtures/fragments.tsrx');
const BASIC = resolve(__dirname, '../_fixtures/basic.tsrx');

describe('differential: attrs-events.tsrx — click → state update → re-render', () => {
  it('Clicker: button onClick → useState setter → text updates', async () => {
    const d = await mountDifferential(ATTRS_EVENTS, 'Clicker');
    await d.step('mount', () => {});
    await d.step('click 1', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    await d.step('click 2', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    d.unmount();
  });

  it('Classed: dynamic class attribute updates correctly', async () => {
    const d = await mountDifferential(ATTRS_EVENTS, 'Classed', { kind: 'red' });
    await d.step('mount kind=red', () => {});
    d.unmount();
  });

  it('WithAttrs: dynamic href + title round-trip', async () => {
    const d = await mountDifferential(ATTRS_EVENTS, 'WithAttrs', { url: '/x', title: 'Help' });
    await d.step('mount', () => {});
    d.unmount();
  });
});

describe('differential: hooks.tsrx — state hooks behave identically', () => {
  it('LazyInit: lazy initializer runs once', async () => {
    const d = await mountDifferential(HOOKS, 'LazyInit');
    await d.step('mount', () => {});
    d.unmount();
  });

  it('TwoStates: independent state slots', async () => {
    const d = await mountDifferential(HOOKS, 'TwoStates');
    await d.step('mount', () => {});
    await d.step('click a', async (i, r) => {
      await i.click('#a');
      await r.click('#a');
    });
    await d.step('click b', async (i, r) => {
      await i.click('#b');
      await r.click('#b');
    });
    d.unmount();
  });

  it('Tally: useReducer dispatches', async () => {
    const d = await mountDifferential(HOOKS, 'Tally');
    await d.step('mount', () => {});
    await d.step('dispatch 1', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    await d.step('dispatch 2', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    d.unmount();
  });
});

describe('differential: fragments.tsrx — fragment rendering parity', () => {
  it('MultiTop: top-level fragment', async () => {
    const d = await mountDifferential(FRAGMENTS, 'MultiTop');
    await d.step('mount', () => {});
    d.unmount();
  });

  it('Mixed: fragment nested under div', async () => {
    const d = await mountDifferential(FRAGMENTS, 'Mixed');
    await d.step('mount', () => {});
    d.unmount();
  });

  it('Nested: nested fragments', async () => {
    const d = await mountDifferential(FRAGMENTS, 'Nested');
    await d.step('mount', () => {});
    d.unmount();
  });
});

describe('differential: control.tsrx — @if/@else control flow', () => {
  it('Toggle: @if/@else branches swap on state change', async () => {
    const d = await mountDifferential(CONTROL, 'Toggle');
    await d.step('mount (off)', () => {});
    await d.step('click → on', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    await d.step('click → off', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    d.unmount();
  });

  it('IfOnly: @if without @else (mount/unmount nothing)', async () => {
    const d = await mountDifferential(CONTROL, 'IfOnly');
    await d.step('mount (false)', () => {});
    await d.step('click → true', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    await d.step('click → false', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    d.unmount();
  });
});

describe('differential: for.tsrx — @for keyed lists', () => {
  it('List: static items render in order', async () => {
    const d = await mountDifferential(FOR, 'List', {
      items: [
        { id: 1, label: 'a' },
        { id: 2, label: 'b' },
        { id: 3, label: 'c' },
      ],
    });
    await d.step('mount', () => {});
    d.unmount();
  });

  it('MutableList: add → reverse → remove permutations', async () => {
    const d = await mountDifferential(FOR, 'MutableList');
    await d.step('mount (3 items)', () => {});
    await d.step('add → 4 items', async (i, r) => {
      await i.click('#add');
      await r.click('#add');
    });
    await d.step('reverse', async (i, r) => {
      await i.click('#reverse');
      await r.click('#reverse');
    });
    await d.step('remove-first', async (i, r) => {
      await i.click('#remove-first');
      await r.click('#remove-first');
    });
    await d.step('clear', async (i, r) => {
      await i.click('#clear');
      await r.click('#clear');
    });
    d.unmount();
  });
});

describe('differential: basic.tsrx SVG/MathML namespace', () => {
  it('SvgStatic: static SVG template', async () => {
    const d = await mountDifferential(BASIC, 'SvgStatic');
    await d.step('mount', () => {});
    d.unmount();
  });

  it('SvgDynamic: dynamic SVG attributes update', async () => {
    const d = await mountDifferential(BASIC, 'SvgDynamic', { klass: 'a', w: 10, fill: 'red' });
    await d.step('mount', () => {});
    d.unmount();
  });

  it('MathStatic: static MathML template', async () => {
    const d = await mountDifferential(BASIC, 'MathStatic');
    await d.step('mount', () => {});
    d.unmount();
  });
});
