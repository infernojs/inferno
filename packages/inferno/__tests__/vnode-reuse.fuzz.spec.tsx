import { compareRuns, type Desc, type Step } from './data/vnode-reuse-fuzzer';

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
    seed: 4,
    name: 'unmount a Portal in the only child of a hoisted Fragment',
    pool: [
      {
        t: 'fragment',
        key: 'p2',
        children: {
          flags: 'unknown',
          children: {
            t: 'portal',
            target: 1,
            child: { t: 'text', key: null, text: 'z' },
          },
        },
      },
    ],
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
                t: 'wrap',
                key: null,
                children: { t: 'hoist', key: null, id: 0 },
              },
            ],
          },
        },
      },
    ],
  },
  {
    seed: 13,
    name: 'patch a text vNode normalized as a child elsewhere like a new vNode',
    pool: [
      { t: 'text', key: null, text: 'y' },
      { t: 'text', key: null, text: 'y' },
    ],
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
              { t: 'shared', id: 0 },
              {
                t: 'element',
                key: null,
                tag: 'div',
                children: {
                  flags: 'unknown',
                  children: { t: 'shared', id: 1 },
                },
              },
            ],
          },
        },
      },
      {
        t: 'render',
        tree: {
          t: 'element',
          key: null,
          tag: 'div',
          children: { flags: 'nonKeyed', children: [{ t: 'shared', id: 1 }] },
        },
      },
    ],
  },
  {
    seed: 77,
    name: 'patch a vNode normalized inside a keyed Fragment elsewhere like a new vNode',
    pool: [{ t: 'text', key: null, text: 'x' }],
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
                tag: 'b',
                children: {
                  flags: 'nonKeyed',
                  children: [
                    {
                      t: 'fragment',
                      key: null,
                      children: {
                        flags: 'keyed',
                        children: [
                          {
                            t: 'element',
                            key: 'c',
                            tag: 'ul',
                            children: {
                              flags: 'unknown',
                              children: { t: 'shared', id: 0 },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      {
        t: 'render',
        tree: {
          t: 'element',
          key: null,
          tag: 'div',
          children: { flags: 'nonKeyed', children: [{ t: 'shared', id: 0 }] },
        },
      },
      {
        t: 'render',
        tree: {
          t: 'element',
          key: null,
          tag: 'div',
          children: {
            flags: 'nonKeyed',
            children: [{ t: 'text', key: null, text: 'x' }],
          },
        },
      },
    ],
  },
  {
    seed: 214,
    name: 'patch a vNode normalized as children of a component elsewhere like a new vNode',
    pool: [{ t: 'text', key: null, text: 'y' }],
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
                tag: 'ul',
                children: {
                  flags: 'nonKeyed',
                  children: [
                    { t: 'box', key: null, children: { t: 'shared', id: 0 } },
                  ],
                },
              },
            ],
          },
        },
      },
      {
        t: 'render',
        tree: {
          t: 'element',
          key: null,
          tag: 'div',
          children: { flags: 'nonKeyed', children: [{ t: 'shared', id: 0 }] },
        },
      },
      {
        t: 'render',
        tree: {
          t: 'element',
          key: null,
          tag: 'div',
          children: {
            flags: 'nonKeyed',
            children: [{ t: 'text', key: null, text: 'y' }],
          },
        },
      },
    ],
  },
  {
    seed: 21,
    name: 'move a Portal to another container when its child becomes a component',
    pool: [
      { t: 'text', key: 'p2', text: 'x' },
      { t: 'text', key: null, text: 'x' },
    ],
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
              { t: 'text', key: null, text: 'x' },
              {
                t: 'portal',
                target: 0,
                child: { t: 'text', key: null, text: 'x' },
              },
            ],
          },
        },
      },
      {
        t: 'render',
        tree: {
          t: 'element',
          key: null,
          tag: 'div',
          children: {
            flags: 'nonKeyed',
            children: [
              { t: 'shared', id: 1 },
              {
                t: 'portal',
                target: 1,
                child: { t: 'hoist', key: null, id: 0 },
              },
            ],
          },
        },
      },
    ],
  },
];

describe('vNode reuse cases found by fuzzing', () => {
  for (const test of CASES) {
    it(`Should ${test.name} (seed ${test.seed})`, () => {
      compareRuns(test.pool, test.steps, `seed ${test.seed}`);
    });
  }
});
