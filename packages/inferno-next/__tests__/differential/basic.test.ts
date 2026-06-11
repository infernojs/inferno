import { describe, it } from 'vitest';
import { mountDifferential } from './_rig.js';
import { resolve } from 'node:path';

const BASIC_FIXTURE = resolve(__dirname, '../_fixtures/basic.tsrx');

describe('differential: basic.tsrx — static templates render identically', () => {
  it('Hello: literal text', async () => {
    const d = await mountDifferential(BASIC_FIXTURE, 'Hello');
    await d.step('mount', () => {});
    d.unmount();
  });

  it('Counter: dynamic numeric text', async () => {
    const d = await mountDifferential(BASIC_FIXTURE, 'Counter', { n: 0 });
    await d.step('mount n=0', () => {});
    d.unmount();
  });

  it('Greet: multi-text-hole', async () => {
    const d = await mountDifferential(BASIC_FIXTURE, 'Greet', { name: 'world' });
    await d.step('mount name=world', () => {});
    d.unmount();
  });

  it('Mixed: multiple sibling elements with class+text', async () => {
    const d = await mountDifferential(BASIC_FIXTURE, 'Mixed');
    await d.step('mount', () => {});
    d.unmount();
  });
});
