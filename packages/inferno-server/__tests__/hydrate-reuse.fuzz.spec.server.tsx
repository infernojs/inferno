import { hydrate } from 'inferno-hydrate';
import { renderToString } from 'inferno-server';
import {
  compareRuns,
  createRandom,
  type Desc,
  Generator,
  Run,
  type Step,
} from '../../inferno/__tests__/data/vnode-reuse-fuzzer';

const SEEDS = Number(process.env.INFERNO_FUZZ_SEEDS) || 200;
const STEPS = 5;

// Hydrates the first step from server rendered HTML of the same tree
function hydrateFirst(pool: Desc[]) {
  return (run: Run, tree: Desc): void => {
    const server = new Run(pool, false);

    run.container.innerHTML = renderToString(server.build(tree));
    server.destroy();
    hydrate(run.build(tree), run.container);
  };
}

interface FuzzCase {
  seed: number;
  name: string;
  pool: Desc[];
  steps: Step[];
}

// Fuzzer seeds that found bugs, shrunk to minimal cases.
// Seeds depend on the generator version, so the generated trees are stored instead of the seeds.
const CASES: FuzzCase[] = [
  {
    seed: 1,
    name: 'hydrate the only element child of a Fragment',
    pool: [],
    steps: [
      {
        t: 'render',
        tree: {
          t: 'element',
          key: null,
          tag: 'div',
          children: {
            flags: 'nonKeyed',
            children: [
              {
                t: 'element',
                key: null,
                tag: 'i',
                children: {
                  flags: 'nonKeyed',
                  children: [
                    {
                      t: 'fragment',
                      key: null,
                      children: {
                        flags: 'single',
                        child: {
                          t: 'element',
                          key: null,
                          tag: 'b',
                          children: { flags: 'none' },
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    ],
  },
  {
    seed: 9,
    name: 'hydrate the only element child of a normalized Fragment',
    pool: [],
    steps: [
      {
        t: 'render',
        tree: {
          t: 'element',
          key: null,
          tag: 'div',
          children: {
            flags: 'nonKeyed',
            children: [
              {
                t: 'fragment',
                key: null,
                children: {
                  flags: 'unknown',
                  children: {
                    t: 'element',
                    key: null,
                    tag: 'b',
                    children: { flags: 'none' },
                  },
                },
              },
            ],
          },
        },
      },
    ],
  },
  {
    seed: 54,
    name: 'server render a component returning an array with a hole',
    pool: [],
    steps: [
      {
        t: 'render',
        tree: {
          t: 'element',
          key: null,
          tag: 'div',
          children: {
            flags: 'nonKeyed',
            children: [{ t: 'wrap', key: null, children: [null] }],
          },
        },
      },
    ],
  },
  {
    seed: 60,
    name: 'server render a hoisted component returning an array with a hole',
    pool: [{ t: 'wrap', key: null, children: [null] }],
    steps: [
      {
        t: 'render',
        tree: {
          t: 'element',
          key: null,
          tag: 'div',
          children: { flags: 'nonKeyed', children: [{ t: 'shared', id: 0 }] },
        },
      },
    ],
  },
];

describe('vNode reuse hydration cases found by fuzzing', () => {
  for (const test of CASES) {
    it(`Should ${test.name} (seed ${test.seed})`, () => {
      compareRuns(
        test.pool,
        test.steps,
        `seed ${test.seed}`,
        hydrateFirst(test.pool),
      );
    });
  }
});

// Hydrating and then rendering vNodes that are referenced outside of render must give the same result as with new vNodes
describe('vNode reuse fuzzing with hydration', () => {
  for (let seed = 1; seed <= SEEDS; ++seed) {
    it(`Should hydrate and render the same DOM with shared and fresh vNodes, seed ${seed}`, () => {
      const generator = new Generator(createRandom(seed), {
        portals: false,
        hydratable: true,
      });

      compareRuns(
        generator.pool,
        generator.steps(STEPS),
        `seed ${seed}`,
        hydrateFirst(generator.pool),
      );
    });
  }
});
