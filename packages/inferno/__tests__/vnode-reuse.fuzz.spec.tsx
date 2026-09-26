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
    seed: 125,
    name: 'patch a Portal normalized as the child of another Portal like a new vNode',
    pool: [
      { t: 'portal', target: 1, child: { t: 'text', key: null, text: 'x' } },
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
              { t: 'shared', id: 0 },
              { t: 'portal', target: 0, child: { t: 'shared', id: 0 } },
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
              { t: 'portal', target: 0, child: { t: 'shared', id: 1 } },
            ],
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
  {
    seed: 99,
    name: 'move a Portal with a class component child to another container',
    pool: [
      { t: 'portal', target: 0, child: { t: 'text', key: null, text: 'x' } },
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
              { t: 'portal', target: 1, child: { t: 'shared', id: 0 } },
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
            children: [
              {
                t: 'portal',
                target: 1,
                child: { t: 'box', key: null, children: null },
              },
            ],
          },
        },
      },
    ],
  },
  {
    seed: 149,
    name: 'keep children of a vNode that is patched away and rendered elsewhere in the same render',
    pool: [
      {
        t: 'element',
        key: null,
        tag: 'span',
        children: {
          flags: 'unknown',
          children: [{ t: 'text', key: null, text: 'x' }],
        },
      },
      { t: 'element', key: null, tag: 'i', children: { flags: 'none' } },
    ],
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
                tag: 'span',
                children: {
                  flags: 'nonKeyed',
                  children: [
                    { t: 'shared', id: 1 },
                    {
                      t: 'element',
                      key: null,
                      tag: 'span',
                      children: {
                        flags: 'nonKeyed',
                        children: [{ t: 'shared', id: 0 }],
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
    seed: 606,
    name: 'keep children of a hoisted element that another element was patched in place of',
    pool: [
      {
        t: 'element',
        key: null,
        tag: 'span',
        children: {
          flags: 'unknown',
          children: [{ t: 'text', key: null, text: 'z' }],
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
            children: [
              {
                t: 'element',
                key: null,
                tag: 'span',
                children: {
                  flags: 'nonKeyed',
                  children: [{ t: 'shared', id: 0 }],
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
    ],
  },
  {
    seed: 699,
    name: 'keep children of a hoisted Fragment that another Fragment was patched in place of',
    pool: [
      {
        t: 'fragment',
        key: null,
        children: {
          flags: 'nonKeyed',
          children: [
            {
              t: 'portal',
              target: 1,
              child: { t: 'text', key: null, text: 'x' },
            },
          ],
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
              { t: 'text', key: null, text: 'x' },
              { t: 'shared', id: 0 },
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
              { t: 'text', key: null, text: 'y' },
              {
                t: 'fragment',
                key: null,
                children: {
                  flags: 'nonKeyed',
                  children: [{ t: 'text', key: null, text: 'x' }],
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
          children: {
            flags: 'nonKeyed',
            children: [
              {
                t: 'element',
                key: null,
                tag: 'li',
                children: {
                  flags: 'nonKeyed',
                  children: [{ t: 'shared', id: 0 }],
                },
              },
            ],
          },
        },
      },
    ],
  },
  {
    seed: 785,
    name: 'keep keyed children of a hoisted element that a non-keyed element was patched in place of',
    pool: [
      {
        t: 'element',
        key: null,
        tag: 'li',
        children: {
          flags: 'keyed',
          children: [{ t: 'text', key: 'c', text: 'x' }],
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
            children: [
              {
                t: 'element',
                key: null,
                tag: 'li',
                children: {
                  flags: 'nonKeyed',
                  children: [{ t: 'text', key: null, text: 'x' }],
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
          children: {
            flags: 'nonKeyed',
            children: [
              {
                t: 'wrap',
                key: null,
                children: {
                  t: 'portal',
                  target: 1,
                  child: { t: 'shared', id: 0 },
                },
              },
            ],
          },
        },
      },
    ],
  },
  {
    seed: 799,
    name: 'keep children of a hoisted Fragment rendered as the only child of another Fragment',
    pool: [
      {
        t: 'fragment',
        key: null,
        children: { flags: 'unknown', children: 'y' },
      },
      {
        t: 'fragment',
        key: null,
        children: {
          flags: 'nonKeyed',
          children: [{ t: 'text', key: null, text: 'x' }],
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
          children: { flags: 'nonKeyed', children: [{ t: 'shared', id: 1 }] },
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
              { t: 'shared', id: 0 },
              {
                t: 'box',
                key: null,
                children: {
                  t: 'fragment',
                  key: null,
                  children: { flags: 'single', child: { t: 'shared', id: 1 } },
                },
              },
            ],
          },
        },
      },
    ],
  },
  {
    seed: 38,
    name: 'unmount a hoisted element with a Portal child rendered in two places',
    pool: [
      {
        t: 'element',
        key: null,
        tag: 'i',
        children: {
          flags: 'nonKeyed',
          children: [
            {
              t: 'portal',
              target: 0,
              child: { t: 'text', key: null, text: 'y' },
            },
          ],
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
                t: 'fragment',
                key: null,
                children: {
                  flags: 'keyed',
                  children: [
                    {
                      t: 'element',
                      key: 'f',
                      tag: 'span',
                      children: {
                        flags: 'keyed',
                        children: [
                          {
                            t: 'element',
                            key: 'e',
                            tag: 'span',
                            children: {
                              flags: 'nonKeyed',
                              children: [{ t: 'shared', id: 0 }],
                            },
                          },
                        ],
                      },
                    },
                    {
                      t: 'element',
                      key: 'e',
                      tag: 'ul',
                      children: {
                        flags: 'nonKeyed',
                        children: [
                          {
                            t: 'element',
                            key: null,
                            tag: 'p',
                            children: {
                              flags: 'single',
                              child: { t: 'shared', id: 0 },
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
      { t: 'render', tree: { t: 'text', key: null, text: 'x' } },
    ],
  },
  {
    seed: 90,
    name: 'unmount the same element with a Portal child rendered twice',
    pool: [
      {
        t: 'element',
        key: null,
        tag: 'span',
        children: {
          flags: 'nonKeyed',
          children: [
            {
              t: 'portal',
              target: 0,
              child: { t: 'text', key: null, text: 'z' },
            },
          ],
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
              { t: 'shared', id: 0 },
              { t: 'shared', id: 0 },
            ],
          },
        },
      },
      { t: 'render', tree: { t: 'text', key: null, text: 'x' } },
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
