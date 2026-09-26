// Fuzz workload: case "S" or "S.N" = seed S, step N (default 1). prepare renders
// state N-1, the op patches to state N. Tree size and mutation count come from
// ?size= and ?mutations=.
import { render } from 'inferno';
import { createOpButton, installHarness } from '../shared/harness.js';
import { createFuzz } from './generator.js';
import { toVNode } from './render.js';

const params = new URLSearchParams(location.search);
const options = {
  size: Number(params.get('size') ?? 500),
  mutations: Number(params.get('mutations') ?? 3),
};
const container = document.getElementById('app');
let next = null;

installHarness({
  root: () => container,
  cases: Array.from({ length: 20 }, (_, i) => String(i + 1)),
  prepare(name) {
    const [seed, stepRaw] = name.split('.');
    const step = Number(stepRaw ?? 1);
    const fuzz = createFuzz(Number(seed), options);
    render(null, container);
    render(toVNode(fuzz.at(step - 1)), container);
    next = fuzz.at(step);
  },
  op: createOpButton(() => render(toVNode(next), container)),
});
