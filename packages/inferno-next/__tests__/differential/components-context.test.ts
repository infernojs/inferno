import { describe, it } from 'vitest';
import { mountDifferential } from './_rig.js';
import { resolve } from 'node:path';

const COMPONENTS = resolve(__dirname, '../_fixtures/components.tsrx');
const CONTEXT = resolve(__dirname, '../_fixtures/context.tsrx');

describe('differential: components.tsrx — component nesting + context flow', () => {
  it('Greeting: nested child component (Greeting → Label) renders prop text', async () => {
    const d = await mountDifferential(COMPONENTS, 'Greeting', { name: 'world' });
    await d.step('mount name=world', () => {});
    d.unmount();
  });

  it('Label: standalone leaf component renders its text prop', async () => {
    const d = await mountDifferential(COMPONENTS, 'Label', { text: 'hi' });
    await d.step('mount text=hi', () => {});
    d.unmount();
  });

  it('ThemeReader: bare consumer falls back to context default', async () => {
    const d = await mountDifferential(COMPONENTS, 'ThemeReader');
    await d.step('mount (default value)', () => {});
    d.unmount();
  });

  it('DefaultOnly: consumer with no Provider in tree uses default', async () => {
    const d = await mountDifferential(COMPONENTS, 'DefaultOnly');
    await d.step('mount', () => {});
    d.unmount();
  });

  it('App: state-driven Provider value toggles consumer on each click', async () => {
    const d = await mountDifferential(COMPONENTS, 'App');
    await d.step('mount (n=0, light)', () => {});
    await d.step('click → n=1, dark', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    await d.step('click → n=2, light', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    await d.step('click → n=3, dark', async (i, r) => {
      await i.click('button');
      await r.click('button');
    });
    d.unmount();
  });

  it('Nested: inner Provider value overrides outer for nested consumer', async () => {
    const d = await mountDifferential(COMPONENTS, 'Nested');
    await d.step('mount (outer/inner)', () => {});
    d.unmount();
  });
});

describe('differential: context.tsrx — multi-context + dynamic providers', () => {
  it('ThemeReader: bare consumer reads context default', async () => {
    const d = await mountDifferential(CONTEXT, 'ThemeReader');
    await d.step('mount (default light)', () => {});
    d.unmount();
  });

  it('UserReader: bare consumer reads UserCtx default', async () => {
    const d = await mountDifferential(CONTEXT, 'UserReader');
    await d.step('mount (default anon)', () => {});
    d.unmount();
  });

  it('CountReader: bare consumer reads CountCtx default', async () => {
    const d = await mountDifferential(CONTEXT, 'CountReader');
    await d.step('mount (default 0)', () => {});
    d.unmount();
  });

  it('CombinedReader: single component reads two context defaults', async () => {
    const d = await mountDifferential(CONTEXT, 'CombinedReader');
    await d.step('mount (light/anon)', () => {});
    d.unmount();
  });

  it('Siblings: multiple sibling consumers all see the same Provider value', async () => {
    const d = await mountDifferential(CONTEXT, 'Siblings');
    await d.step('mount (all dark)', () => {});
    d.unmount();
  });

  it('TwoContexts: distinct contexts in one tree do not leak into each other', async () => {
    const d = await mountDifferential(CONTEXT, 'TwoContexts');
    await d.step('mount (dark, alice, dark/alice)', () => {});
    d.unmount();
  });

  it('DynamicProvider: Provider value update re-renders consumer', async () => {
    const d = await mountDifferential(CONTEXT, 'DynamicProvider');
    await d.step('mount (init)', () => {});
    await d.step('click → changed', async (i, r) => {
      await i.click('#swap');
      await r.click('#swap');
    });
    await d.step('click → init', async (i, r) => {
      await i.click('#swap');
      await r.click('#swap');
    });
    d.unmount();
  });

  it('ConditionalUse: show=true mounts a consumer inside @if branch', async () => {
    const d = await mountDifferential(CONTEXT, 'ConditionalUse', { show: true });
    await d.step('mount show=true', () => {});
    d.unmount();
  });

  it('ConditionalUse: show=false takes @else branch (no consumer mounted)', async () => {
    const d = await mountDifferential(CONTEXT, 'ConditionalUse', { show: false });
    await d.step('mount show=false', () => {});
    d.unmount();
  });

  it('ListConsumers: for-of body uses() context per row, all see same value', async () => {
    const d = await mountDifferential(CONTEXT, 'ListConsumers', {
      value: 42,
      items: [1, 2, 3],
    });
    await d.step('mount (3 rows, value=42)', () => {});
    d.unmount();
  });

  it('LiveCount: incrementing Provider value re-renders every for-of consumer', async () => {
    const d = await mountDifferential(CONTEXT, 'LiveCount', { ids: [1, 2, 3] });
    await d.step('mount (n=0, 3 rows)', () => {});
    await d.step('click → n=1', async (i, r) => {
      await i.click('#inc');
      await r.click('#inc');
    });
    await d.step('click → n=2', async (i, r) => {
      await i.click('#inc');
      await r.click('#inc');
    });
    await d.step('click → n=3', async (i, r) => {
      await i.click('#inc');
      await r.click('#inc');
    });
    d.unmount();
  });
});
