// Every uibench test case (desktop set) as a micro case: prepare renders the
// `from` state, the op renders `to`, on the same components as apps/uibench.
import { render } from 'inferno';
import { Main } from '../../apps/uibench/components.jsx';
import { config, init, initTests } from '../../apps/uibench/lib.js';
import { defineCase, newContainer } from './common.js';

init('Inferno', 'bench', {});
initTests();

export const cases = {};
for (const test of config.tests) {
  let container = null;
  cases[`uibench/${test.name}`] = defineCase({
    iterations: 150,
    warmup: 30,
    setup: () => (container = newContainer()),
    prepare: () => render(<Main data={test.from} />, container),
    op: () => render(<Main data={test.to} />, container),
    root: () => container,
  });
}
