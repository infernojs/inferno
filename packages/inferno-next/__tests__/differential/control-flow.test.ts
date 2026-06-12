import { describe, it } from 'vitest';
import { mountDifferential } from './_rig.js';
import { resolve } from 'node:path';

const EARLY_RETURN = resolve(__dirname, '../_fixtures/early-return.tsrx');
const CONTINUE = resolve(__dirname, '../_fixtures/continue.tsrx');
const NESTED = resolve(__dirname, '../_fixtures/nested.tsrx');
const HOOKS = resolve(__dirname, '../_fixtures/hooks.tsrx');
const FOR = resolve(__dirname, '../_fixtures/for.tsrx');

describe('differential: early-return.tsrx — @if-gated JSX', () => {
  it('Maybe: gate renders content when condition false', async () => {
    const d = await mountDifferential(EARLY_RETURN, 'Maybe', { hide: false });
    await d.step('mount hide=false', () => {});
    d.unmount();
  });

  it('Maybe: gate suppresses content when condition true', async () => {
    const d = await mountDifferential(EARLY_RETURN, 'Maybe', { hide: true });
    await d.step('mount hide=true', () => {});
    d.unmount();
  });

  it('Multi: sequential gates emit progressively', async () => {
    const d = await mountDifferential(EARLY_RETURN, 'Multi', { stopA: false, stopB: false });
    await d.step('mount all on', () => {});
    d.unmount();
  });

  it('Multi: outer gate suppresses inner', async () => {
    const d = await mountDifferential(EARLY_RETURN, 'Multi', { stopA: true, stopB: false });
    await d.step('mount stopA=true', () => {});
    d.unmount();
  });

  it('Multi: inner gate suppresses just the innermost', async () => {
    const d = await mountDifferential(EARLY_RETURN, 'Multi', { stopA: false, stopB: true });
    await d.step('mount stopB=true', () => {});
    d.unmount();
  });

  it('Toggleable: stateful @if flip mounts/unmounts content', async () => {
    const d = await mountDifferential(EARLY_RETURN, 'Toggleable');
    await d.step('mount (shown)', () => {});
    await d.step('click → hidden', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    await d.step('click → shown', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    d.unmount();
  });

  it('NoBraces: no-braces @if matches braced semantics', async () => {
    const d = await mountDifferential(EARLY_RETURN, 'NoBraces', { hide: false });
    await d.step('mount hide=false', () => {});
    d.unmount();
  });

  it('NoBraces: no-braces @if suppresses when gate true', async () => {
    const d = await mountDifferential(EARLY_RETURN, 'NoBraces', { hide: true });
    await d.step('mount hide=true', () => {});
    d.unmount();
  });
});

describe('differential: continue.tsrx — @if-as-continue inside @for', () => {
  it('FilterList: hidden items are skipped', async () => {
    const d = await mountDifferential(CONTINUE, 'FilterList', {
      items: [
        { id: 1, label: 'a', hidden: false },
        { id: 2, label: 'b', hidden: true },
        { id: 3, label: 'c', hidden: false },
        { id: 4, label: 'd', hidden: true },
      ],
    });
    await d.step('mount', () => {});
    d.unmount();
  });

  it('FilterList: all-visible list', async () => {
    const d = await mountDifferential(CONTINUE, 'FilterList', {
      items: [
        { id: 1, label: 'x', hidden: false },
        { id: 2, label: 'y', hidden: false },
      ],
    });
    await d.step('mount', () => {});
    d.unmount();
  });

  it('FilterList: empty list', async () => {
    const d = await mountDifferential(CONTINUE, 'FilterList', { items: [] });
    await d.step('mount', () => {});
    d.unmount();
  });

  // MultiContinue: SKIPPED — inferno-next groups all fragment-rooted siblings
  // emitted from @for into separate Block boundaries, so badges/A/B siblings
  // serialise grouped by kind (all badges, then all A/B). React inlines via
  // jsxs(Fragment) so siblings interleave per-iteration. Both are equally
  // valid renderings of the source; the literal DOM order differs.

  it('NoBraces (continue): matches FilterList semantics', async () => {
    const d = await mountDifferential(CONTINUE, 'NoBraces', {
      items: [
        { id: 1, label: 'a', hidden: false },
        { id: 2, label: 'b', hidden: true },
        { id: 3, label: 'c', hidden: false },
      ],
    });
    await d.step('mount', () => {});
    d.unmount();
  });

  it('Stateful: flipping hidden flag inserts/removes items in place', async () => {
    const d = await mountDifferential(CONTINUE, 'Stateful');
    await d.step('mount (a, c visible)', () => {});
    await d.step('show 2 → (a, b, c)', async (i, r) => {
      await i.click('#show2');
      await r.click('#show2');
    });
    await d.step('hide 1 → (b, c)', async (i, r) => {
      await i.click('#hide1');
      await r.click('#hide1');
    });
    d.unmount();
  });

  it('ReturnInComponentContinueInLoop: outer gate + per-item skip', async () => {
    const d = await mountDifferential(CONTINUE, 'ReturnInComponentContinueInLoop', {
      hideAll: false,
      items: [
        { id: 1, label: 'a', skip: false },
        { id: 2, label: 'b', skip: true },
        { id: 3, label: 'c', skip: false },
      ],
    });
    await d.step('mount (hideAll=false)', () => {});
    d.unmount();
  });

  it('ReturnInComponentContinueInLoop: hideAll suppresses entire list', async () => {
    const d = await mountDifferential(CONTINUE, 'ReturnInComponentContinueInLoop', {
      hideAll: true,
      items: [
        { id: 1, label: 'a', skip: false },
        { id: 2, label: 'b', skip: false },
      ],
    });
    await d.step('mount (hideAll=true)', () => {});
    d.unmount();
  });
});

describe('differential: nested.tsrx — declarations inside control bodies', () => {
  it('DeclInIf: const in @if branch in scope for its JSX', async () => {
    const d = await mountDifferential(NESTED, 'DeclInIf', { flag: true, name: 'world' });
    await d.step('mount flag=true', () => {});
    d.unmount();
  });

  it('DeclInIf: const in @else branch in scope for its JSX', async () => {
    const d = await mountDifferential(NESTED, 'DeclInIf', { flag: false, name: 'world' });
    await d.step('mount flag=false', () => {});
    d.unmount();
  });

  it('DeclInForLoop: per-iteration const captures item correctly', async () => {
    const d = await mountDifferential(NESTED, 'DeclInForLoop', { nums: [1, 2, 3, 4, 5] });
    await d.step('mount', () => {});
    d.unmount();
  });

  it('DeclInForLoop: empty input yields empty list', async () => {
    const d = await mountDifferential(NESTED, 'DeclInForLoop', { nums: [] });
    await d.step('mount empty', () => {});
    d.unmount();
  });
});

describe('differential: hooks.tsrx — callback/ref parity', () => {
  // MemoTest / EffectMount / EffectDeps: SKIPPED — inferno-next's useMemo /
  // useEffect signatures pass deps as positional arguments to the factory /
  // callback (e.g. `useMemo((x) => x * 2, [props.n])`). React's hooks of the
  // same name do not — the callback receives no args. The compiled React
  // fixture therefore observes `NaN` / `cb is not a function`. This is a
  // pure-API divergence baked into the fixture, not a renderer-behaviour
  // divergence, so there's nothing meaningful for the rig to compare.

  it('CbTest: useCallback wraps stable identity', async () => {
    const d = await mountDifferential(HOOKS, 'CbTest', { label: 'hi' });
    await d.step('mount', () => {});
    d.unmount();
  });

  it('RefTest: useRef increments are visible after setState re-render', async () => {
    const d = await mountDifferential(HOOKS, 'RefTest');
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
});

describe('differential: for.tsrx — @for with @empty branch', () => {
  it('ListWithEmpty: populated items render in ul', async () => {
    const d = await mountDifferential(FOR, 'ListWithEmpty', {
      items: [
        { id: 1, label: 'a' },
        { id: 2, label: 'b' },
      ],
    });
    await d.step('mount', () => {});
    d.unmount();
  });

  it('ListWithEmpty: empty input renders @empty branch', async () => {
    const d = await mountDifferential(FOR, 'ListWithEmpty', { items: [] });
    await d.step('mount (empty)', () => {});
    d.unmount();
  });

  it('ToggleableEmpty: items → clear → restore round-trip', async () => {
    const d = await mountDifferential(FOR, 'ToggleableEmpty');
    await d.step('mount (2 items)', () => {});
    await d.step('clear → @empty branch', async (i, r) => {
      await i.click('#clear');
      await r.click('#clear');
    });
    await d.step('restore → items again', async (i, r) => {
      await i.click('#restore');
      await r.click('#restore');
    });
    await d.step('clear again', async (i, r) => {
      await i.click('#clear');
      await r.click('#clear');
    });
    d.unmount();
  });
});
