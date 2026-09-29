/**
 * domcalls mode: counts calls to the DOM, CSSOM and scheduling APIs that animation and rendering
 * code pays for (layout reads, computed style, inline style reads/writes, class changes, event
 * listeners, Web Animations queries, timers, frames and tree mutations).
 *
 * Injected before any page script. window.__benchProbe() returns a copy of the counts; the
 * session instrumentation reads it at the input, after the next frame, at the end of the window
 * and once more after the settle time, so the counts are exact per window. The wrappers make the
 * page slower: this mode reports counts only.
 */
export const CALLS_INSTRUMENT = String.raw`(() => {
  const counts = Object.create(null);
  const bump = (name) => { counts[name] = (counts[name] || 0) + 1; };
  const computed = new WeakSet();

  const method = (proto, name, label) => {
    const d = proto && Object.getOwnPropertyDescriptor(proto, name);
    if (!d || typeof d.value !== 'function') return;
    const original = d.value;
    Object.defineProperty(proto, name, {
      ...d,
      value: { [name](...args) { bump(label); return Reflect.apply(original, this, args); } }[name],
    });
  };
  const accessor = (proto, name, getLabel, setLabel) => {
    const d = proto && Object.getOwnPropertyDescriptor(proto, name);
    if (!d || (!d.get && !d.set)) return;
    Object.defineProperty(proto, name, {
      ...d,
      get: d.get && getLabel ? function () { bump(getLabel); return d.get.call(this); } : d.get,
      set: d.set && setLabel ? function (v) { bump(setLabel); d.set.call(this, v); } : d.set,
    });
  };

  // Layout reads
  method(Element.prototype, 'getBoundingClientRect', 'layout.getBoundingClientRect');
  method(Element.prototype, 'getClientRects', 'layout.getClientRects');
  for (const name of ['offsetWidth', 'offsetHeight', 'offsetTop', 'offsetLeft']) {
    accessor(HTMLElement.prototype, name, 'layout.' + name, null);
  }
  method(SVGGraphicsElement.prototype, 'getScreenCTM', 'layout.getScreenCTM');

  // Computed style
  const getComputedStyle = window.getComputedStyle;
  window.getComputedStyle = function (...args) {
    bump('style.getComputedStyle');
    const cs = Reflect.apply(getComputedStyle, window, args);
    computed.add(cs);
    return cs;
  };

  // Inline and computed style reads and writes, by method and by property accessor
  const decl = CSSStyleDeclaration.prototype;
  const kind = (s) => (computed.has(s) ? 'computed' : 'inline');
  for (const name of ['getPropertyValue', 'getPropertyPriority']) {
    const original = decl[name];
    decl[name] = function (...args) { bump(kind(this) + '.read'); return Reflect.apply(original, this, args); };
  }
  for (const name of ['setProperty', 'removeProperty']) {
    const original = decl[name];
    decl[name] = function (...args) { bump('inline.' + name); return Reflect.apply(original, this, args); };
  }
  for (const name of Object.getOwnPropertyNames(decl)) {
    const d = Object.getOwnPropertyDescriptor(decl, name);
    if (!d.get || !d.set || name === 'length' || name === 'parentRule') continue;
    Object.defineProperty(decl, name, {
      ...d,
      get() { bump(kind(this) + '.read'); return d.get.call(this); },
      set(v) { bump(name === 'cssText' ? 'inline.cssText' : 'inline.set'); d.set.call(this, v); },
    });
  }
  accessor(HTMLElement.prototype, 'style', null, 'inline.styleAttr');

  // Classes and attributes
  for (const name of ['add', 'remove', 'toggle', 'replace']) method(DOMTokenList.prototype, name, 'class.' + name);
  method(DOMTokenList.prototype, 'contains', 'class.contains');
  accessor(Element.prototype, 'className', 'class.read', 'class.set');
  method(Element.prototype, 'setAttribute', 'attr.set');
  method(Element.prototype, 'removeAttribute', 'attr.remove');

  // Listeners
  method(EventTarget.prototype, 'addEventListener', 'listener.add');
  method(EventTarget.prototype, 'removeEventListener', 'listener.remove');

  // Web Animations
  method(Element.prototype, 'getAnimations', 'anim.getAnimations');
  method(Document.prototype, 'getAnimations', 'anim.documentGetAnimations');
  method(Element.prototype, 'animate', 'anim.animate');
  method(KeyframeEffect.prototype, 'getKeyframes', 'anim.getKeyframes');

  // Scheduling
  for (const name of ['requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'clearTimeout', 'queueMicrotask']) {
    const original = window[name];
    window[name] = function (...args) { bump('sched.' + name); return Reflect.apply(original, window, args); };
  }

  // Tree mutations
  for (const name of ['insertBefore', 'appendChild', 'removeChild', 'replaceChild']) method(Node.prototype, name, 'tree.' + name);
  method(Element.prototype, 'remove', 'tree.remove');
  accessor(Node.prototype, 'textContent', null, 'tree.textContent');
  accessor(Node.prototype, 'nodeValue', null, 'tree.nodeValue');

  window.__benchProbe = () => Object.assign(Object.create(null), counts);
})();`;

export type CallCounts = Record<string, number>;

export interface CallsSample {
  op: CallCounts;
  window: CallCounts;
  settled: CallCounts;
}

export function diffCounts(a: CallCounts | null | undefined, b: CallCounts | null | undefined): CallCounts {
  const out: CallCounts = {};
  if (!a || !b) {
    return out;
  }
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const d = (a[k] ?? 0) - (b[k] ?? 0);
    if (d !== 0) {
      out[k] = d;
    }
  }
  return out;
}

/** Op minus null op, per window. */
export function subtractCalls(op: CallsSample, nul: CallsSample): CallsSample {
  return { op: diffCounts(op.op, nul.op), window: diffCounts(op.window, nul.window), settled: diffCounts(op.settled, nul.settled) };
}

/** Column groups of the table: prefix sums. */
export const CALL_GROUPS: [string, (name: string) => boolean][] = [
  ['layout', (n) => n.startsWith('layout.')],
  ['gCS', (n) => n === 'style.getComputedStyle'],
  ['computed rd', (n) => n === 'computed.read'],
  ['inline rd', (n) => n === 'inline.read'],
  ['inline wr', (n) => n.startsWith('inline.') && n !== 'inline.read'],
  ['class', (n) => n.startsWith('class.') && n !== 'class.read' && n !== 'class.contains'],
  ['listeners', (n) => n.startsWith('listener.')],
  ['anim', (n) => n.startsWith('anim.')],
  ['sched', (n) => n.startsWith('sched.')],
  ['tree', (n) => n.startsWith('tree.')],
];

export function groupCounts(c: CallCounts): number[] {
  return CALL_GROUPS.map(([, match]) => Object.entries(c).reduce((sum, [k, v]) => (match(k) ? sum + v : sum), 0));
}
