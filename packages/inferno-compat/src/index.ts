import {
  Component,
  createComponentVNode,
  createPortal,
  createRenderer,
  createTextVNode,
  createVNode,
  directClone,
  hydrate,
  EMPTY_OBJ,
  getFlagsForElementVnode,
  InfernoChildren,
  InfernoInput,
  getNumberStyleValue,
  linkEvent,
  normalizeProps,
  options,
  Props,
  Refs,
  render,
  VNode
} from 'inferno';
import { cloneVNode } from 'inferno-clone-vnode';
import { ClassicComponentClass, ComponentSpec, createClass } from 'inferno-create-class';
import { createElement } from 'inferno-create-element';
import { isArray, isBrowser, isFunction, isInvalid, isNull, isNullOrUndef, isString, NO_OP } from 'inferno-shared';
import { VNodeFlags } from 'inferno-vnode-flags';
import { isValidElement } from './isValidElement';
import PropTypes from './PropTypes';
import { SVGDOMPropertyConfig } from './SVGDOMPropertyConfig';

declare global {
  interface Event {
    persist: Function;
  }
}

function unmountComponentAtNode(container: Element | SVGAElement | DocumentFragment): boolean {
  render(null, container);
  return true;
}

function extend(base, props) {
  for (let i = 1, obj; i < arguments.length; i++) {
    if ((obj = arguments[i])) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          base[key] = obj[key];
        }
      }
    }
  }
  return base;
}

export type IterateChildrenFn = (value: InfernoChildren | any, index: number, array: Array<InfernoChildren | any>) => any;

function flatten(arr, result) {
  for (let i = 0, len = arr.length; i < len; i++) {
    const value = arr[i];
    if (isArray(value)) {
      flatten(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
}

const ARR = [];

const Children = {
  map(children: Array<InfernoChildren | any>, fn: IterateChildrenFn, ctx: any): any[] {
    if (isNullOrUndef(children)) {
      return children;
    }
    children = Children.toArray(children);
    if (ctx && ctx !== children) {
      fn = fn.bind(ctx);
    }
    return children.map(fn);
  },
  forEach(children: Array<InfernoChildren | any>, fn: IterateChildrenFn, ctx?: any): void {
    if (isNullOrUndef(children)) {
      return;
    }
    children = Children.toArray(children);
    if (ctx && ctx !== children) {
      fn = fn.bind(ctx);
    }
    for (let i = 0, len = children.length; i < len; i++) {
      const child = isInvalid(children[i]) ? null : children[i];

      fn(child, i, children);
    }
  },
  count(children: Array<InfernoChildren | any>): number {
    children = Children.toArray(children);
    return children.length;
  },
  only(children: Array<InfernoChildren | any>): InfernoChildren | any {
    children = Children.toArray(children);
    if (children.length !== 1) {
      throw new Error('Children.only() expects only one child.');
    }
    return children[0];
  },
  toArray(children: Array<InfernoChildren | any>): Array<InfernoChildren | any> {
    if (isNullOrUndef(children)) {
      return [];
    }
    // We need to flatten arrays here,
    // because React does it also and application level code might depend on that behavior
    if (isArray(children)) {
      const result = [];

      flatten(children, result);

      return result;
    }
    return ARR.concat(children);
  }
};

(Component.prototype as any).isReactComponent = {};

let currentComponent: any = null;

options.beforeRender = function(component): void {
  currentComponent = component;
};
options.afterRender = function(): void {
  currentComponent = null;
};

const version = '15.4.2';

function normalizeGenericProps(props) {
  for (const prop in props) {
    if (prop === 'onDoubleClick') {
      props.onDblClick = props[prop];
      props[prop] = void 0;
    }
    if (prop === 'htmlFor') {
      props.for = props[prop];
      props[prop] = void 0;
    }
    const mappedProp = SVGDOMPropertyConfig[prop];
    if (mappedProp && props[prop] && mappedProp !== prop) {
      props[mappedProp] = props[prop];
      props[prop] = void 0;
    }
  }
}

function normalizeFormProps<P>(name: string, props: Props<P> | any) {
  if ((name === 'input' || name === 'textarea') && props.type !== 'radio' && props.onChange) {
    const type = props.type;
    let eventName;

    if (!type || type === 'text') {
      eventName = 'oninput';
    } else if (type === 'file') {
      eventName = 'onchange';
    }

    if (eventName && !props[eventName]) {
      props[eventName] = props.onChange;
      props.onChange = void 0;
    }
  }
}

// we need to add persist() to Event (as React has it for synthetic events)
// this is a hack and we really shouldn't be modifying a global object this way,
// but there isn't a performant way of doing this apart from trying to proxy
// every prop event that starts with "on", i.e. onClick or onKeyPress
// but in reality devs use onSomething for many things, not only for
// input events
if (typeof Event !== 'undefined') {
  const eventProtoType = Event.prototype as any;

  if (!eventProtoType.persist) {
    // tslint:disable-next-line:no-empty
    eventProtoType.persist = function() {};
  }
  if (!eventProtoType.isDefaultPrevented) {
    eventProtoType.isDefaultPrevented = function() {
      return this.defaultPrevented;
    };
  }
  if (!eventProtoType.isPropagationStopped) {
    eventProtoType.isPropagationStopped = function() {
      return this.cancelBubble;
    };
  }
}

function iterableToArray(iterable) {
  let iterStep;
  const tmpArr: any[] = [];
  do {
    iterStep = iterable.next();
    tmpArr.push(iterStep.value);
  } while (!iterStep.done);

  return tmpArr;
}

const g: any = typeof window === 'undefined' ? global : window;
const hasSymbolSupport = typeof g.Symbol !== 'undefined';
const symbolIterator = hasSymbolSupport ? g.Symbol.iterator : '';
const oldCreateVNode = options.createVNode;

options.createVNode = (vNode: VNode) => {
  const children = vNode.children as any;
  const ref = vNode.ref;
  let props: any = vNode.props;

  if (isNullOrUndef(props)) {
    props = vNode.props = {};
  }

  // React supports iterable children, in addition to Array-like
  if (hasSymbolSupport && !isNull(children) && !isArray(children) && typeof children === 'object' && isFunction(children[symbolIterator])) {
    vNode.children = iterableToArray(children[symbolIterator]());
  }
  if (typeof ref === 'string' && !isNull(currentComponent)) {
    if (!currentComponent.refs) {
      currentComponent.refs = {};
    }
    vNode.ref = function(val) {
      (this as any).refs[ref] = val;
    }.bind(currentComponent);
  }
  if (vNode.className) {
    props.className = vNode.className;
  }

  if (!isNullOrUndef(children) && isNullOrUndef(props.children)) {
    props.children = children;
  }
  if (vNode.flags & VNodeFlags.Component) {
    if (isString(vNode.type)) {
      vNode.flags = getFlagsForElementVnode(vNode.type as string);
      if (props) {
        normalizeProps(vNode);
      }
    }
  }

  const flags = vNode.flags;

  if (flags & VNodeFlags.FormElement) {
    normalizeFormProps(vNode.type, props);
  }
  if (flags & VNodeFlags.Element) {
    normalizeGenericProps(props);
  }

  if (oldCreateVNode) {
    oldCreateVNode(vNode);
  }
};

// Credit: preact-compat - https://github.com/developit/preact-compat :)
function shallowDiffers(a, b): boolean {
  for (const i in a) {
    if (!(i in b)) {
      return true;
    }
  }
  for (const i in b) {
    if (a[i] !== b[i]) {
      return true;
    }
  }
  return false;
}

class PureComponent<P, S> extends Component<P, S> {
  public shouldComponentUpdate(props, state) {
    return shallowDiffers(this.props, props) || shallowDiffers(this.state, state);
  }
}

interface ContextProps {
  context: any;
}

type WrapperComponentProps<P> = P & ContextProps;

class WrapperComponent<P, S> extends Component<WrapperComponentProps<P>, S> {
  public getChildContext() {
    // tslint:disable-next-line
    return this.props.context;
  }

  public render(props) {
    return props.children;
  }
}

function unstable_renderSubtreeIntoContainer(parentComponent, vNode, container, callback) {
  const wrapperVNode: VNode = createComponentVNode(VNodeFlags.ComponentClass, WrapperComponent, {
    children: vNode,
    context: parentComponent.context
  });
  render(wrapperVNode, container);
  const component = vNode.children;

  if (callback) {
    // callback gets the component as context, no other argument.
    callback.call(component);
  }
  return component;
}

// Credit: preact-compat - https://github.com/developit/preact-compat
const ELEMENTS = 'a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr circle clipPath defs ellipse g image line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan'.split(
  ' '
);

function createFactory(type) {
  return createElement.bind(null, type);
}

const DOM = {};
for (let i = ELEMENTS.length; i--; ) {
  DOM[ELEMENTS[i]] = createFactory(ELEMENTS[i]);
}

function findDOMNode(ref) {
  if (ref && ref.nodeType) {
    return ref;
  }

  if (!ref || ref.$UN) {
    return null;
  }

  if (ref.$LI) {
    return ref.$LI.dom;
  }

  return null;
}

// Mask React global in browser enviornments when React is not used.
if (isBrowser && typeof (window as any).React === 'undefined') {
  const exports = {
    Children,
    Component,
    DOM,
    EMPTY_OBJ,
    NO_OP,
    PropTypes,
    PureComponent,
    __spread: extend,
    cloneElement: cloneVNode,
    cloneVNode,
    createClass,
    createComponentVNode,
    createElement,
    createFactory,
    createPortal,
    createRenderer,
    createTextVNode,
    createVNode,
    directClone,
    findDOMNode,
    getFlagsForElementVnode,
    getNumberStyleValue,
    hydrate,
    isValidElement,
    linkEvent,
    normalizeProps,
    options,
    render,
    unmountComponentAtNode,
    unstable_renderSubtreeIntoContainer,
    version
  };

  (window as any).React = exports;
  (window as any).ReactDOM = exports;
}

export {
  Children,
  ClassicComponentClass,
  Component,
  ComponentSpec,
  DOM,
  EMPTY_OBJ,
  InfernoChildren,
  InfernoInput,
  NO_OP,
  Props,
  PropTypes,
  PureComponent,
  Refs,
  VNode,
  cloneVNode as cloneElement,
  cloneVNode,
  createClass,
  createComponentVNode,
  createElement,
  createFactory,
  createPortal,
  createRenderer,
  createTextVNode,
  createVNode,
  directClone,
  extend as __spread,
  findDOMNode,
  getFlagsForElementVnode,
  getNumberStyleValue,
  hydrate,
  isValidElement,
  linkEvent,
  normalizeProps,
  options,
  render,
  unmountComponentAtNode,
  unstable_renderSubtreeIntoContainer,
  version
};

export default {
  Children,
  Component,
  DOM,
  EMPTY_OBJ,
  NO_OP,
  PropTypes,
  PureComponent,
  __spread: extend,
  cloneElement: cloneVNode,
  cloneVNode,
  createClass,
  createComponentVNode,
  createElement,
  createFactory,
  createPortal,
  createRenderer,
  createTextVNode,
  createVNode,
  directClone,
  findDOMNode,
  getFlagsForElementVnode,
  getNumberStyleValue,
  hydrate,
  isValidElement,
  linkEvent,
  normalizeProps,
  options,
  render,
  unmountComponentAtNode,
  unstable_renderSubtreeIntoContainer,
  version
};
