// Seeded random tree sequences (apps/fuzz): iteration i patches state i -> i+1,
// so the per-case DOM-op total is a deterministic fingerprint of the sequence.
import { render } from 'inferno';
import { createFuzz } from '../../apps/fuzz/generator.js';
import { toVNode } from '../../apps/fuzz/render.js';
import { defineCase, newContainer } from './common.js';

export const cases = {};
for (let seed = 1; seed <= 10; seed++) {
  let container = null;
  let fuzz = null;
  let step = 0;
  cases[`fuzz/${seed}`] = defineCase({
    iterations: 150,
    warmup: 30,
    setup() {
      container = newContainer();
      fuzz = createFuzz(seed, { size: 500, mutations: 3 });
      render(toVNode(fuzz.at(0)), container);
    },
    prepare() {
      // Precompute the next state so only vNode creation + patch are timed.
      fuzz.at(step + 1);
    },
    op() {
      step++;
      render(toVNode(fuzz.at(step)), container);
    },
    root: () => container,
  });
}

const traces = new Map();

/** Renders step `step` of fuzz sequence `seed` into `container` (steps must be visited in order). */
export function renderFuzzStep(seed, step, container) {
  let fuzz = traces.get(seed);
  if (!fuzz) {
    fuzz = createFuzz(seed, { size: 500, mutations: 3 });
    traces.set(seed, fuzz);
  }
  render(toVNode(fuzz.at(step)), container);
}
