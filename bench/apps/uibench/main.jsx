// uibench app: each uibench test case is a (from, to) state pair. prepare(case)
// renders `from`, the op renders `to`.
import { render } from 'inferno';
import { createOpButton, installHarness } from '../shared/harness.js';
import { Main } from './components.jsx';
import { config, init, initTests, specTest } from './lib.js';

const container = document.getElementById('App');
const update = (state) => render(<Main data={state} />, container);

init('Inferno', 'bench', Object.fromEntries(new URLSearchParams(location.search)));
initTests();
const tests = new Map(config.tests.map((t) => [t.name, t]));
let current = null;

installHarness({
  root: () => container,
  cases: [...tests.keys()],
  prepare(name) {
    current = tests.get(name);
    if (!current) {
      throw new Error(`Unknown uibench case ${name}`);
    }
    update(current.from);
  },
  op: createOpButton(() => update(current.to)),
  extra: { specTest: () => specTest(update) },
});
