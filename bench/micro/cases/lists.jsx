// Keyed and non-keyed list diffing: the permutations that stress prefix/suffix
// sync, the keyIndex map, the O(n·m) small-list scan and the LIS move path.
import { render } from 'inferno';
import { createRandom } from '../../apps/shared/prng.js';
import { defineCase, newContainer } from './common.js';

const N = 1000;

function makeItems(n, offset = 0) {
  return Array.from({ length: n }, (_, i) => ({ id: offset + i, label: `item ${offset + i}` }));
}

function Row({ item }) {
  return <li $HasTextChildren>{item.label}</li>;
}

function rowShouldUpdate(last, next) {
  return last.item !== next.item;
}

function keyedElements(items) {
  const out = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    out.push(
      <li key={item.id} $HasTextChildren>
        {item.label}
      </li>,
    );
  }
  return <ul $HasKeyedChildren>{out}</ul>;
}

function keyedComponents(items) {
  const out = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    out.push(<Row key={item.id} item={item} onComponentShouldUpdate={rowShouldUpdate} />);
  }
  return <ul $HasKeyedChildren>{out}</ul>;
}

function nonKeyedElements(items) {
  const out = [];
  for (let i = 0; i < items.length; i++) {
    out.push(<li $HasTextChildren>{items[i].label}</li>);
  }
  return <ul $HasNonKeyedChildren>{out}</ul>;
}

function shuffle(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Each transform maps the base list to the target list for iteration i. */
const keyedTransforms = {
  swap2: (base) => {
    const a = base.slice();
    [a[1], a[a.length - 2]] = [a[a.length - 2], a[1]];
    return a;
  },
  reverse: (base) => base.slice().reverse(),
  shuffle: (base, i) => shuffle(base, createRandom(1000 + i)),
  prepend1: (base, i) => [{ id: -1 - i, label: 'new' }, ...base],
  append1: (base, i) => [...base, { id: 1e6 + i, label: 'new' }],
  'insert-middle': (base, i) => [...base.slice(0, N / 2), { id: 2e6 + i, label: 'new' }, ...base.slice(N / 2)],
  'remove-middle': (base) => [...base.slice(0, N / 2), ...base.slice(N / 2 + 1)],
  'remove-first': (base) => base.slice(1),
  'replace-all': (_base, i) => makeItems(N, 1e7 + i * N),
  'move-evens-to-end': (base) => [...base.filter((_, j) => j % 2 === 1), ...base.filter((_, j) => j % 2 === 0)],
  'move-one-far': (base) => [...base.slice(1, N - 10), base[0], ...base.slice(N - 10)],
  'small-shuffle-10': (base, i) => {
    const head = shuffle(base.slice(0, 10), createRandom(500 + i));
    return [...head, ...base.slice(10)];
  },
};

function listCase(render_, transform) {
  let container = null;
  let base = null;
  return defineCase({
    iterations: 150,
    warmup: 30,
    setup() {
      container = newContainer();
      base = makeItems(N);
    },
    prepare() {
      render(render_(base), container);
    },
    op(i) {
      render(render_(transform(base, i)), container);
    },
    root: () => container,
  });
}

const nonKeyedTransforms = {
  'update-all-text': (base, i) => base.map((it) => ({ id: it.id, label: `${it.label} ${i % 2}` })),
  append1: (base, i) => [...base, { id: 1e6 + i, label: 'new' }],
  'remove-last': (base) => base.slice(0, -1),
  'remove-first': (base) => base.slice(1),
};

export const cases = {};
for (const [name, t] of Object.entries(keyedTransforms)) {
  cases[`keyed/el/${name}`] = listCase(keyedElements, t);
  cases[`keyed/fc/${name}`] = listCase(keyedComponents, t);
}
for (const [name, t] of Object.entries(nonKeyedTransforms)) {
  cases[`nonkeyed/el/${name}`] = listCase(nonKeyedElements, t);
}
