// Seeded random tree workloads. A tree is plain data; each step applies a few
// structural or prop mutations copy-on-write, so untouched subtrees keep their
// identity and shouldComponentUpdate paths behave like a real app.
//
// Kept free of DOM and Inferno imports so the same sequences can drive the
// Node micro suite (with the counting DOM shim) and the browser app.
import { createRandom } from '../shared/prng.js';

const TAGS = ['div', 'span', 'p', 'ul', 'li', 'section', 'b', 'em'];
const CLASSES = [null, 'a', 'b', 'c', 'row', 'cell active', 'x y z'];
const WORDS = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta'];

export function createFuzz(seed, { size = 500, maxDepth = 6, mutations = 3 } = {}) {
  const rnd = createRandom(seed);
  let nextKey = 0;
  let budget = 0;

  const int = (n) => Math.floor(rnd() * n);
  const pick = (arr) => arr[int(arr.length)];
  const chance = (p) => rnd() < p;
  const word = () => pick(WORDS) + int(100);
  const newKey = () => 'k' + nextKey++;

  function genChildren(depth, mode) {
    const count = depth >= maxDepth || budget <= 0 ? 0 : 1 + int(6);
    const kids = [];
    for (let i = 0; i < count && budget > 0; i++) {
      kids.push(genNode(depth + 1, mode === 'keyed'));
    }
    return kids;
  }

  function genNode(depth, keyed) {
    budget--;
    const key = keyed ? newKey() : null;
    const r = rnd();
    if (depth >= maxDepth || budget <= 0 || r < 0.12) {
      return { k: 'text', key, v: word() };
    }
    if (r < 0.22) {
      return { k: 'fn', key, tint: int(3), kids: genChildren(depth, 'nonkeyed') };
    }
    if (r < 0.3) {
      return { k: 'cls', key, kids: genChildren(depth, 'keyed').filter(Boolean) };
    }
    if (r < 0.36) {
      const kids = genChildren(depth, 'keyed');
      return { k: 'frag', key, kids: kids.length ? kids : [{ k: 'text', key: newKey(), v: word() }] };
    }
    const mode = pick(['keyed', 'keyed', 'nonkeyed', 'unknown', 'text']);
    return {
      k: 'el',
      key,
      tag: pick(TAGS),
      cls: pick(CLASSES),
      attrs: chance(0.3) ? { title: word() } : null,
      style: chance(0.15) ? { color: pick(['red', 'blue', 'green']) } : null,
      mode,
      text: mode === 'text' ? word() : null,
      kids: mode === 'text' ? [] : genChildren(depth, mode),
    };
  }

  function hasList(n) {
    return (n.k === 'el' && n.mode !== 'text') || n.k === 'fn' || n.k === 'cls' || n.k === 'frag';
  }

  function isKeyedList(n) {
    return (n.k === 'el' && n.mode === 'keyed') || n.k === 'cls' || n.k === 'frag';
  }

  /** Pre-order list of [node, path] where path is the child-index chain from the root. */
  function collect(root) {
    const out = [];
    const walk = (n, path) => {
      out.push([n, path]);
      if (n.kids) {
        n.kids.forEach((c, i) => walk(c, [...path, i]));
      }
    };
    walk(root, []);
    return out;
  }

  /** Copy-on-write update of the node at `path`. */
  function updateAt(n, path, fn) {
    if (path.length === 0) {
      return fn({ ...n, kids: n.kids ? n.kids.slice() : n.kids });
    }
    const kids = n.kids.slice();
    kids[path[0]] = updateAt(kids[path[0]], path.slice(1), fn);
    return { ...n, kids };
  }

  function mutateList(n) {
    const keyed = isKeyedList(n);
    const kids = n.kids;
    const op = int(keyed ? 6 : 3);
    budget = 20;
    if (op === 0 || kids.length === 0) {
      kids.splice(int(kids.length + 1), 0, genNode(3, keyed));
    } else if (op === 1 && (kids.length > 1 || n.k !== 'frag')) {
      kids.splice(int(kids.length), 1);
    } else if (op === 2) {
      const i = int(kids.length);
      const replacement = genNode(3, keyed);
      if (keyed && chance(0.5)) {
        replacement.key = kids[i].key;
      }
      kids[i] = replacement;
    } else if (op === 3) {
      const [moved] = kids.splice(int(kids.length), 1);
      kids.splice(int(kids.length + 1), 0, moved);
    } else if (op === 4) {
      kids.reverse();
    } else if (kids.length > 1) {
      const i = int(kids.length);
      const j = int(kids.length);
      [kids[i], kids[j]] = [kids[j], kids[i]];
    }
    return n;
  }

  function mutateProps(n) {
    if (n.k === 'text') {
      n.v = word();
    } else if (n.k === 'fn') {
      n.tint = (n.tint + 1) % 3;
    } else if (n.k === 'el') {
      const op = int(4);
      if (op === 0) {
        n.cls = pick(CLASSES);
      } else if (op === 1) {
        n.attrs = chance(0.5) ? { title: word() } : null;
      } else if (op === 2) {
        n.style = chance(0.5) ? { color: pick(['red', 'blue', 'green']), 'font-weight': pick(['400', '700']) } : null;
      } else if (n.mode === 'text') {
        n.text = word();
      } else {
        n.cls = pick(CLASSES);
      }
    }
    return n;
  }

  function step(root) {
    let tree = root;
    for (let m = 0; m < mutations; m++) {
      const nodes = collect(tree);
      const [node, path] = nodes[int(nodes.length)];
      if (hasList(node) && chance(0.6)) {
        tree = updateAt(tree, path, mutateList);
      } else if (path.length > 0 && chance(0.15)) {
        // Replace the whole subtree, keeping the key so keyed parents patch in place.
        tree = updateAt(tree, path.slice(0, -1), (parent) => {
          budget = 30;
          const idx = path[path.length - 1];
          const replacement = genNode(3, isKeyedList(parent));
          replacement.key = parent.kids[idx].key;
          parent.kids[idx] = replacement;
          return parent;
        });
      } else {
        tree = updateAt(tree, path, mutateProps);
      }
    }
    return tree;
  }

  budget = size;
  const initial = {
    k: 'el',
    key: null,
    tag: 'div',
    cls: 'fuzz-root',
    attrs: null,
    style: null,
    mode: 'keyed',
    text: null,
    kids: [],
  };
  while (budget > 0) {
    initial.kids.push(genNode(1, true));
  }

  // Steps share one RNG stream, so states are memoized and always produced in order.
  const states = [initial];
  return {
    initial,
    /** State after `n` steps from the initial tree. */
    at(n) {
      while (states.length <= n) {
        states.push(step(states[states.length - 1]));
      }
      return states[n];
    },
  };
}

export function countNodes(root) {
  let n = 0;
  const walk = (x) => {
    n++;
    if (x.kids) {
      x.kids.forEach(walk);
    }
  };
  walk(root);
  return n;
}
