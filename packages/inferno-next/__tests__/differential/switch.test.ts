import { describe, it } from 'vitest';
import { mountDifferential } from './_rig.js';
import { resolve } from 'node:path';

const FIXTURE = resolve(__dirname, '../_fixtures/switch.tsrx');

// Cross-runtime pin for @switch / @case / @default lowering. The inferno-
// next runtime mounts a switchBlock slot whose case selection mirrors
// React's standard discriminant comparison. PickKind / Cycle / NoDefault
// are all canonical shapes that compile via @tsrx/react without issue.
//
// HookInCase is skipped — the fixture authors useState INSIDE @case
// branch bodies, which inferno-next supports (per-block-boundary hook
// slots reset on branch swap) but React's rules-of-hooks rejects
// outright. Same shape as the RefInIf skip in refs-effects.test.ts.

describe('differential: switch.tsrx — @switch / @case', () => {
  it('PickKind: case "a" selected by kind prop', async () => {
    const d = await mountDifferential(FIXTURE, 'PickKind', { kind: 'a' });
    await d.step('mount kind=a', () => {});
    d.unmount();
  });

  it('PickKind: case "b" selected by kind prop', async () => {
    const d = await mountDifferential(FIXTURE, 'PickKind', { kind: 'b' });
    await d.step('mount kind=b', () => {});
    d.unmount();
  });

  it('PickKind: @default fires when no @case matches', async () => {
    const d = await mountDifferential(FIXTURE, 'PickKind', { kind: 'zzz' });
    await d.step('mount kind=zzz', () => {});
    d.unmount();
  });

  it('Cycle: numeric discriminant cycles through cases on click', async () => {
    const d = await mountDifferential(FIXTURE, 'Cycle');
    await d.step('mount n=0', () => {});
    await d.step('bump → n=1', async (i, r) => {
      await i.click('#bump');
      await r.click('#bump');
    });
    await d.step('bump → n=2', async (i, r) => {
      await i.click('#bump');
      await r.click('#bump');
    });
    await d.step('bump → n=3 (wraps to case 0)', async (i, r) => {
      await i.click('#bump');
      await r.click('#bump');
    });
    await d.step('bump → n=4 (case 1 again)', async (i, r) => {
      await i.click('#bump');
      await r.click('#bump');
    });
    d.unmount();
  });

  it('NoDefault: no matching case leaves the slot empty between siblings', async () => {
    const d = await mountDifferential(FIXTURE, 'NoDefault', { kind: 'nope' });
    await d.step('mount (no match)', () => {});
    d.unmount();
  });

  it('NoDefault: matching case fills the slot between siblings', async () => {
    const d = await mountDifferential(FIXTURE, 'NoDefault', { kind: 'show' });
    await d.step('mount (match)', () => {});
    d.unmount();
  });

  // SKIP: HookInCase authors useState inside @case branch bodies.
  // inferno-next supports per-block-boundary hooks (each branch owns its
  // own slot, resets on swap); React's rules-of-hooks rejects this with
  // "Rendered fewer hooks than expected." Pure inferno-next feature.
  it.skip('HookInCase: branch-local hooks reset on case swap', async () => {});
});
