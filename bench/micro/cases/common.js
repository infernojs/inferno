// Shared helpers for micro cases. The DOM shim is reached through the global the
// worker installs (not imported), so counters live in exactly one module instance.

export const shim = () => globalThis.__shim;

export function click(el) {
  return shim().click(el);
}

export function newContainer() {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
}

/** Depth-first search over element children (untimed helper for prepare steps). */
export function find(root, pred) {
  for (const child of root.childNodes) {
    if (child.nodeType === 1) {
      if (pred(child)) {
        return child;
      }
      const hit = find(child, pred);
      if (hit) {
        return hit;
      }
    }
  }
  return null;
}

export function byId(root, id) {
  return find(root, (el) => el.getAttribute('id') === id);
}

export function byClass(root, cls) {
  return find(root, (el) => (el.getAttribute('class') ?? '').split(' ').includes(cls));
}

export function children(el) {
  return Array.from(el.childNodes).filter((n) => n.nodeType === 1);
}

/**
 * Case definition:
 *   setup()      once, untimed
 *   prepare(i)   before each iteration, untimed
 *   op(i)        the measured operation
 *   root()       container whose serialized DOM is checksummed after the run
 *   iterations / warmup   fixed counts so DOM-op totals are deterministic
 */
export function defineCase(def) {
  return { iterations: 200, warmup: 50, prepare() {}, setup() {}, ...def };
}
