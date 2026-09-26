// Counting DOM shim: the subset of the DOM Inferno touches, implemented in plain
// JS with every read/write call tallied. Used by the Node and d8 micro suites to
// get exact, deterministic "DOM operations per op" and to measure Inferno's own
// JS cost without Blink. No imports so it also loads in d8.
//
// Semantics follow browsers where Inferno depends on them: re-inserting a node
// moves it, textContent= replaces children, className/style reflect to
// attributes, events bubble to document and support composedPath().

export const counts = Object.create(null);

function tick(op) {
  counts[op] = (counts[op] | 0) + 1;
}

export function resetCounts() {
  for (const k in counts) {
    delete counts[k];
  }
}

export function snapshotCounts() {
  const out = {};
  for (const k of Object.keys(counts).sort()) {
    out[k] = counts[k];
  }
  return out;
}

/** FNV-1a 32-bit + length, the same signature format as apps/shared/harness.js. */
export function fnv(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `${(h >>> 0).toString(16).padStart(8, '0')}:${str.length}`;
}

const HTML_NS = 'http://www.w3.org/1999/xhtml';
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

function escapeText(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;');
}

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/ /g, '&nbsp;');
}

export class Node {
  constructor(nodeType, ownerDocument) {
    this.nodeType = nodeType;
    this.ownerDocument = ownerDocument;
    this._parent = null;
    this._first = null;
    this._last = null;
    this._next = null;
    this._prev = null;
    this._listeners = null;
  }

  get parentNode() {
    tick('get:parentNode');
    return this._parent;
  }

  get firstChild() {
    tick('get:firstChild');
    return this._first;
  }

  get lastChild() {
    tick('get:lastChild');
    return this._last;
  }

  get nextSibling() {
    tick('get:nextSibling');
    return this._next;
  }

  get previousSibling() {
    tick('get:previousSibling');
    return this._prev;
  }

  get childNodes() {
    tick('get:childNodes');
    const out = [];
    for (let c = this._first; c !== null; c = c._next) {
      out.push(c);
    }
    return out;
  }

  _unlink(child) {
    if (child._prev) {
      child._prev._next = child._next;
    } else {
      this._first = child._next;
    }
    if (child._next) {
      child._next._prev = child._prev;
    } else {
      this._last = child._prev;
    }
    child._parent = child._next = child._prev = null;
  }

  _link(child, ref) {
    if (child._parent !== null) {
      child._parent._unlink(child);
    }
    child._parent = this;
    if (ref === null) {
      child._prev = this._last;
      if (this._last) {
        this._last._next = child;
      } else {
        this._first = child;
      }
      this._last = child;
    } else {
      if (ref._parent !== this) {
        throw new Error('insertBefore: reference node is not a child of this node');
      }
      child._next = ref;
      child._prev = ref._prev;
      if (ref._prev) {
        ref._prev._next = child;
      } else {
        this._first = child;
      }
      ref._prev = child;
    }
    return child;
  }

  appendChild(child) {
    tick('appendChild');
    return this._link(child, null);
  }

  insertBefore(child, ref) {
    tick('insertBefore');
    return this._link(child, ref ?? null);
  }

  removeChild(child) {
    tick('removeChild');
    if (child._parent !== this) {
      throw new Error('removeChild: node is not a child of this node');
    }
    this._unlink(child);
    return child;
  }

  replaceChild(newChild, oldChild) {
    tick('replaceChild');
    if (oldChild._parent !== this) {
      throw new Error('replaceChild: node is not a child of this node');
    }
    const ref = oldChild._next === newChild ? newChild._next : oldChild._next;
    this._unlink(oldChild);
    this._link(newChild, ref);
    return oldChild;
  }

  _removeAll() {
    while (this._first !== null) {
      this._unlink(this._first);
    }
  }

  get textContent() {
    tick('get:textContent');
    return this._text();
  }

  _text() {
    let s = '';
    for (let c = this._first; c !== null; c = c._next) {
      s += c._text();
    }
    return s;
  }

  set textContent(value) {
    tick('set:textContent');
    this._removeAll();
    const s = value == null ? '' : String(value);
    if (s !== '') {
      this._link(new Text(s, this.ownerDocument), null);
    }
  }

  addEventListener(type, fn, options) {
    tick('addEventListener');
    const capture = typeof options === 'boolean' ? options : !!options?.capture;
    const list = ((this._listeners ??= Object.create(null))[type] ??= []);
    if (!list.some((l) => l.fn === fn && l.capture === capture)) {
      list.push({ fn, capture });
    }
  }

  removeEventListener(type, fn, options) {
    tick('removeEventListener');
    const capture = typeof options === 'boolean' ? options : !!options?.capture;
    const list = this._listeners?.[type];
    if (list) {
      const i = list.findIndex((l) => l.fn === fn && l.capture === capture);
      if (i !== -1) {
        list.splice(i, 1);
      }
    }
  }

  // Not counted: dispatching is the simulated user input, not framework work.
  dispatchEvent(event) {
    event.target = this;
    const path = [];
    for (let n = this; n !== null; n = n._parent) {
      path.push(n);
    }
    if (this.ownerDocument && path[path.length - 1] === this.ownerDocument && this.ownerDocument.defaultView) {
      path.push(this.ownerDocument.defaultView);
    }
    event._path = path;
    const invoke = (node, capture) => {
      const list = node._listeners?.[event.type];
      if (!list) {
        return;
      }
      for (const l of list.slice()) {
        if (l.capture === capture || node === event.target) {
          event._currentTarget = node;
          l.fn.call(node, event);
        }
      }
    };
    for (let i = path.length - 1; i > 0 && !event._stop; i--) {
      invoke(path[i], true);
    }
    if (!event._stop) {
      invoke(this, false);
    }
    if (event.bubbles) {
      for (let i = 1; i < path.length && !event._stop; i++) {
        invoke(path[i], false);
      }
    }
    event._currentTarget = null;
    return !event.defaultPrevented;
  }
}

export class Text extends Node {
  constructor(data, ownerDocument) {
    super(3, ownerDocument);
    this._data = data;
  }

  get nodeName() {
    return '#text';
  }

  get nodeValue() {
    tick('get:nodeValue');
    return this._data;
  }

  set nodeValue(v) {
    tick('set:nodeValue');
    this._data = String(v);
  }

  get data() {
    return this._data;
  }

  set data(v) {
    tick('set:nodeValue');
    this._data = String(v);
  }

  _text() {
    return this._data;
  }

  set textContent(v) {
    tick('set:textContent');
    this._data = v == null ? '' : String(v);
  }

  get textContent() {
    tick('get:textContent');
    return this._data;
  }

  _html() {
    return escapeText(this._data);
  }
}

class Style {
  constructor(el) {
    this._el = el;
    this._decls = new Map();
  }

  _sync() {
    let s = '';
    for (const [k, v] of this._decls) {
      s += (s ? ' ' : '') + `${k}: ${v};`;
    }
    this._el._attrs.set('style', s);
  }

  setProperty(name, value) {
    tick('style.setProperty');
    if (value === '' || value == null) {
      this._decls.delete(name);
    } else {
      this._decls.set(name, String(value));
    }
    this._sync();
  }

  removeProperty(name) {
    tick('style.removeProperty');
    const had = this._decls.get(name) ?? '';
    this._decls.delete(name);
    this._sync();
    return had;
  }

  getPropertyValue(name) {
    return this._decls.get(name) ?? '';
  }

  get cssText() {
    return this._el._attrs.get('style') ?? '';
  }

  set cssText(text) {
    tick('style.cssText');
    this._decls.clear();
    for (const part of String(text).split(';')) {
      const i = part.indexOf(':');
      if (i > 0) {
        this._decls.set(part.slice(0, i).trim(), part.slice(i + 1).trim());
      }
    }
    this._sync();
  }
}

export class Element extends Node {
  constructor(localName, namespaceURI, ownerDocument) {
    super(1, ownerDocument);
    this.localName = localName;
    this.namespaceURI = namespaceURI;
    this._attrs = new Map();
    this._style = null;
    // Form-control state lives in properties, like in browsers (no attribute reflection).
    this._value = '';
    this.checked = false;
    this.selected = false;
    this.defaultChecked = false;
  }

  get tagName() {
    return this.namespaceURI === HTML_NS ? this.localName.toUpperCase() : this.localName;
  }

  get nodeName() {
    return this.tagName;
  }

  get className() {
    tick('get:className');
    return this._attrs.get('class') ?? '';
  }

  set className(v) {
    tick('set:className');
    this._attrs.set('class', v == null ? '' : String(v));
  }

  get id() {
    return this._attrs.get('id') ?? '';
  }

  set id(v) {
    tick('set:id');
    this._attrs.set('id', String(v));
  }

  get style() {
    tick('get:style');
    return (this._style ??= new Style(this));
  }

  get value() {
    tick('get:value');
    return this._value;
  }

  set value(v) {
    tick('set:value');
    this._value = v == null ? '' : String(v);
  }

  get defaultValue() {
    return this._attrs.get('value') ?? '';
  }

  set defaultValue(v) {
    tick('set:defaultValue');
    this._attrs.set('value', String(v));
  }

  get multiple() {
    return this._attrs.has('multiple');
  }

  set multiple(v) {
    tick('set:multiple');
    if (v) {
      this._attrs.set('multiple', '');
    } else {
      this._attrs.delete('multiple');
    }
  }

  get type() {
    return this._attrs.get('type') ?? '';
  }

  set type(v) {
    tick('set:type');
    this._attrs.set('type', String(v));
  }

  get options() {
    const out = [];
    const walk = (n) => {
      for (let c = n._first; c !== null; c = c._next) {
        if (c.localName === 'option') {
          out.push(c);
        } else if (c.nodeType === 1) {
          walk(c);
        }
      }
    };
    walk(this);
    return out;
  }

  get selectedIndex() {
    return this.options.findIndex((o) => o.selected);
  }

  set selectedIndex(i) {
    tick('set:selectedIndex');
    this.options.forEach((o, j) => (o.selected = j === i));
  }

  setAttribute(name, value) {
    tick('setAttribute');
    if (name === 'style') {
      this.style.cssText = value;
      return;
    }
    this._attrs.set(name, String(value));
  }

  setAttributeNS(_ns, name, value) {
    tick('setAttributeNS');
    this._attrs.set(name, String(value));
  }

  removeAttribute(name) {
    tick('removeAttribute');
    if (name === 'style') {
      this._style = null;
    }
    this._attrs.delete(name);
  }

  removeAttributeNS(_ns, name) {
    tick('removeAttributeNS');
    this._attrs.delete(name.includes(':') ? name : name);
  }

  getAttribute(name) {
    tick('getAttribute');
    return this._attrs.get(name) ?? null;
  }

  hasAttribute(name) {
    tick('hasAttribute');
    return this._attrs.has(name);
  }

  focus() {
    tick('focus');
    this.ownerDocument.activeElement = this;
  }

  get innerHTML() {
    return this._inner();
  }

  set innerHTML(html) {
    tick('set:innerHTML');
    this._removeAll();
    if (html) {
      // Raw markup is kept verbatim; the shim does not parse HTML.
      this._link(new RawHTML(String(html), this.ownerDocument), null);
    }
  }

  get outerHTML() {
    return this._html();
  }

  _inner() {
    let s = '';
    for (let c = this._first; c !== null; c = c._next) {
      s += c._html();
    }
    return s;
  }

  _html() {
    let s = `<${this.localName}`;
    for (const [k, v] of this._attrs) {
      s += ` ${k}="${escapeAttr(v)}"`;
    }
    s += '>';
    if (this.namespaceURI === HTML_NS && VOID.has(this.localName)) {
      return s;
    }
    return s + this._inner() + `</${this.localName}>`;
  }
}

class RawHTML extends Node {
  constructor(html, ownerDocument) {
    super(3, ownerDocument);
    this._raw = html;
  }

  _text() {
    return this._raw.replace(/<[^>]*>/g, '');
  }

  _html() {
    return this._raw;
  }
}

export class Document extends Node {
  constructor() {
    super(9, null);
    this.ownerDocument = null;
    this.defaultView = null;
    this.activeElement = null;
    this.documentElement = new Element('html', HTML_NS, this);
    this.head = new Element('head', HTML_NS, this);
    this.body = new Element('body', HTML_NS, this);
    this._link(this.documentElement, null);
    this.documentElement._link(this.head, null);
    this.documentElement._link(this.body, null);
  }

  createElement(tag) {
    tick('createElement');
    return new Element(String(tag).toLowerCase(), HTML_NS, this);
  }

  createElementNS(ns, tag) {
    tick('createElementNS');
    return new Element(String(tag), ns, this);
  }

  createTextNode(data) {
    tick('createTextNode');
    return new Text(String(data), this);
  }

  createComment() {
    tick('createComment');
    const c = new Text('', this);
    c.nodeType = 8;
    c._html = () => '<!---->';
    return c;
  }

  getElementById(id) {
    const walk = (n) => {
      for (let c = n._first; c !== null; c = c._next) {
        if (c.nodeType === 1) {
          if (c._attrs.get('id') === id) {
            return c;
          }
          const hit = walk(c);
          if (hit) {
            return hit;
          }
        }
      }
      return null;
    };
    return walk(this);
  }
}

export class Event {
  constructor(type, init = {}) {
    this.type = type;
    this.bubbles = !!init.bubbles;
    this.cancelable = !!init.cancelable;
    this.target = null;
    this._currentTarget = null;
    this.defaultPrevented = false;
    this.cancelBubble = false;
    this._stop = false;
    this._path = null;
    this.timeStamp = 0;
  }

  // An accessor on the prototype like in browsers; Inferno shadows it per event.
  get currentTarget() {
    return this._currentTarget;
  }

  stopPropagation() {
    this._stop = true;
    this.cancelBubble = true;
  }

  // Independent of stopPropagation (Inferno overrides that one and calls this).
  stopImmediatePropagation() {
    this._stop = true;
    this._stopImmediate = true;
    this.cancelBubble = true;
  }

  preventDefault() {
    if (this.cancelable) {
      this.defaultPrevented = true;
    }
  }

  composedPath() {
    tick('composedPath');
    return this._path ? this._path.slice() : [];
  }
}

/** A primary-button mouse event, as produced by a real left click. */
export class MouseEvent extends Event {
  constructor(type, init = {}) {
    super(type, init);
    this.button = init.button ?? 0;
    this.buttons = init.buttons ?? 0;
    this.detail = init.detail ?? 1;
    this.clientX = init.clientX ?? 0;
    this.clientY = init.clientY ?? 0;
    this.ctrlKey = this.shiftKey = this.altKey = this.metaKey = false;
  }
}

/** Installs window/document/Node globals. Must run before Inferno is imported. */
export function installDom(g = globalThis) {
  const document = new Document();
  document.defaultView = g;
  g.window = g;
  g.document = document;
  g.Node = Node;
  g.Element = Element;
  g.HTMLElement = Element;
  g.Text = Text;
  g.Event = Event;
  g.MouseEvent = MouseEvent;
  g.requestAnimationFrame ??= (cb) => setTimeout(() => cb(performance.now()), 0);
  return document;
}

/** Clicks `el` like a user would: a bubbling, cancelable click event. */
export function click(el) {
  return el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, detail: 1 }));
}
