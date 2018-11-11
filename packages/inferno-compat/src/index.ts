import {
  Component,
  ComponentType,
  createComponentVNode,
  createPortal,
  createRenderer,
  createTextVNode,
  createVNode,
  directClone,
  EMPTY_OBJ,
  getFlagsForElementVnode,
  InfernoNode,
  linkEvent,
  normalizeProps,
  options,
  Props,
  Refs,
  __render,
  VNode,
  findDOMfromVNode,
  Fragment,
  createFragment,
  createRef,
  forwardRef,
  rerender,
  _CI,
  _HI,
  _M,
  _MCCC,
  _ME,
  _MFCC,
  _MR,
  _MT,
  _MP
} from 'inferno';
import { hydrate } from 'inferno-hydrate';
import { cloneVNode } from 'inferno-clone-vnode';
import { ClassicComponentClass, ComponentSpec, createClass } from 'inferno-create-class';
import { createElement } from 'inferno-create-element';
import { isArray, isFunction, isInvalid, isNull, isNullOrUndef, isNumber, isString, warning } from 'inferno-shared';
import { VNodeFlags } from 'inferno-vnode-flags';
import { isValidElement } from './isValidElement';
import PropTypes from './PropTypes';
import { InfernoCompatPropertyMap } from './InfernoCompatPropertyMap';
import { findDOMNode } from 'inferno-extras';
import { getNumberStyleValue, hyphenCase } from './reactstyles';

declare global {
  interface Event {
    persist: Function;
  }
}

options.reactStyles = true;

function unmountComponentAtNode(container: Element | SVGAElement | DocumentFragment): boolean {
  __render(null, container, null, null);
  return true;
}

export type IterateChildrenFn = (value: InfernoNode | any, index: number, array: Array<InfernoNode | any>) => any;

function flatten(arr, result) {
  for (let i = 0, len = arr.length; i < len; ++i) {
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
  map(children: Array<InfernoNode | any>, fn: IterateChildrenFn, ctx: any): any[] {
    if (isNullOrUndef(children)) {
      return children;
    }
    children = Children.toArray(children);
    if (ctx && ctx !== children) {
      fn = fn.bind(ctx);
    }
    return children.map(fn);
  },
  forEach(children: Array<InfernoNode | any>, fn: IterateChildrenFn, ctx?: any): void {
    if (isNullOrUndef(children)) {
      return;
    }
    children = Children.toArray(children);
    if (ctx && ctx !== children) {
      fn = fn.bind(ctx);
    }
    for (let i = 0, len = children.length; i < len; ++i) {
      const child = isInvalid(children[i]) ? null : children[i];

      fn(child, i, children);
    }
  },
  count(children: Array<InfernoNode | any>): number {
    children = Children.toArray(children);
    return children.length;
  },
  only(children: Array<InfernoNode | any>): InfernoNode | any {
    children = Children.toArray(children);
    if (children.length !== 1) {
      throw new Error('Children.only() expects only one child.');
    }
    return children[0];
  },
  toArray(children: Array<InfernoNode | any>): Array<InfernoNode | any> {
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

const version = '15.4.2';

const validLineInputs = {
  date: true,
  'datetime-local': true,
  email: true,
  month: true,
  number: true,
  password: true,
  search: true,
  tel: true,
  text: true,
  time: true,
  url: true,
  week: true
};

function normalizeGenericProps(props) {
  for (const prop in props) {
    const mappedProp = InfernoCompatPropertyMap[prop];
    if (mappedProp && props[prop] && mappedProp !== prop) {
      props[mappedProp] = props[prop];
      props[prop] = void 0;
    }

    if (options.reactStyles && prop === 'style') {
      const styles = props.style;

      if (styles && !isString(styles)) {
        const newStyles = {};
        for (const s in styles) {
          const value = styles[s];
          const hyphenStr = hyphenCase(s);

          newStyles[hyphenStr] = isNumber(value) ? getNumberStyleValue(hyphenStr, value) : value;
        }
        props.style = newStyles;
      }
    }
  }
}

function normalizeFormProps<P>(name: string, props: Props<P> | any) {
  if ((name === 'input' || name === 'textarea') && props.type !== 'radio' && props.onChange) {
    const type = props.type && props.type.toLowerCase();
    let eventName;

    if (!type || validLineInputs[type]) {
      eventName = 'oninput';
    }

    if (eventName && !props[eventName]) {
      if (process.env.NODE_ENV !== 'production') {
        const existingMethod = props.oninput || props.onInput;

        if (existingMethod) {
          warning(
            `Inferno-compat Warning! 'onInput' handler is reserved to support React like 'onChange' event flow.
Original event handler 'function ${existingMethod.name}' will not be called.`
          );
        }
      }
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
  let props: any = vNode.props;

  if (isNullOrUndef(props)) {
    props = vNode.props = {};
  }

  // React supports iterable children, in addition to Array-like
  if (hasSymbolSupport && !isNull(children) && typeof children === 'object' && !isArray(children) && isFunction(children[symbolIterator])) {
    vNode.children = iterableToArray(children[symbolIterator]());
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
    if (vNode.className) {
      props.className = vNode.className;
    }
    normalizeGenericProps(props);
  }

  if (oldCreateVNode) {
    oldCreateVNode(vNode);
  }
};

// Credit: preact-compat - https://github.com/developit/preact-compat :)
function shallowDiffers(a, b): boolean {
  let i;

  for (i in a) {
    if (!(i in b)) {
      return true;
    }
  }

  for (i in b) {
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
  render(wrapperVNode, container, null);
  const component = vNode.children;

  if (callback) {
    // callback gets the component as context, no other argument.
    callback.call(component);
  }
  return component;
}

function createFactory(type) {
  return createElement.bind(null, type);
}

function render(rootInput, container, cb = null, context = EMPTY_OBJ) {
  __render(rootInput, container, cb, context);

  const input = container.$V;

  if (input && input.flags & VNodeFlags.Component) {
    return input.children;
  }
}

// Mask React global in browser enviornments when React is not used.
if (typeof window !== 'undefined' && typeof (window as any).React === 'undefined') {
  const exports = {
    Children,
    Component,
    EMPTY_OBJ,
    Fragment,
    PropTypes,
    PureComponent,
    // Internal methods
    _CI,
    _HI,
    _M,
    _MCCC,
    _ME,
    _MFCC,
    _MP,
    _MR,
    _MT,
    __render,
    // Public methods
    cloneElement: cloneVNode,
    cloneVNode,
    createClass,
    createComponentVNode,
    createElement,
    createFactory,
    createFragment,
    createPortal,
    createRef,
    createRenderer,
    createTextVNode,
    createVNode,
    directClone,
    findDOMNode,
    findDOMfromVNode,
    forwardRef,
    getFlagsForElementVnode,
    hydrate,
    isValidElement,
    linkEvent,
    normalizeProps,
    options,
    render,
    rerender,
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
  ComponentType,
  EMPTY_OBJ,
  Fragment,
  InfernoNode,
  Props,
  PropTypes,
  PureComponent,
  Refs,
  VNode,
  // Internal methods
  _CI,
  _HI,
  _M,
  _MCCC,
  _ME,
  _MFCC,
  _MP,
  _MR,
  _MT,
  __render,
  // Public methods
  cloneVNode as cloneElement,
  cloneVNode,
  createClass,
  createComponentVNode,
  createElement,
  createFactory,
  createFragment,
  createPortal,
  createRef,
  createRenderer,
  createTextVNode,
  createVNode,
  directClone,
  findDOMNode,
  findDOMfromVNode,
  forwardRef,
  getFlagsForElementVnode,
  hydrate,
  isValidElement,
  linkEvent,
  normalizeProps,
  options,
  render,
  rerender,
  unmountComponentAtNode,
  unstable_renderSubtreeIntoContainer,
  version
};

export default {
  Children,
  Component,
  EMPTY_OBJ,
  Fragment,
  PropTypes,
  PureComponent,
  // Internal methods
  _CI,
  _HI,
  _M,
  _MCCC,
  _ME,
  _MFCC,
  _MP,
  _MR,
  _MT,
  __render,
  // Public methods
  cloneElement: cloneVNode,
  cloneVNode,
  createClass,
  createComponentVNode,
  createElement,
  createFactory,
  createFragment,
  createPortal,
  createRef,
  createRenderer,
  createTextVNode,
  createVNode,
  directClone,
  findDOMNode,
  findDOMfromVNode,
  forwardRef,
  getFlagsForElementVnode,
  hydrate,
  isValidElement,
  linkEvent,
  normalizeProps,
  options,
  render,
  rerender,
  unmountComponentAtNode,
  unstable_renderSubtreeIntoContainer,
  version
};
