import {
  renderInternal,
  _CI,
  _HI,
  _M,
  _MCCC,
  _ME,
  _MFCC,
  _MP,
  _MR,
  Component,
  type ComponentType,
  createComponentVNode,
  createFragment,
  createPortal,
  createRef,
  createRenderer,
  createTextVNode,
  createVNode,
  directClone,
  EMPTY_OBJ,
  findDOMFromVNode,
  forwardRef,
  Fragment,
  getFlagsForElementVnode,
  type InfernoNode,
  linkEvent,
  type MouseEventHandler,
  normalizeProps,
  options,
  rerender,
  type VNode,
} from 'inferno';
import { hydrate } from 'inferno-hydrate';
import { cloneVNode } from 'inferno-clone-vnode';
import { createElement, type CreateElementProps } from 'inferno-create-element';
import {
  isArray,
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isNumber,
  isString,
  warning,
} from 'inferno-shared';
import { VNodeFlags } from 'inferno-vnode-flags';
import { isValidElement } from 'inferno-shared';
import PropTypes from './PropTypes';
import { InfernoCompatPropertyMap } from './InfernoCompatPropertyMap';
import { findDOMNode } from 'inferno-extras';
import { getNumberStyleValue, hyphenCase } from './reactstyles';

export type { ComponentType, Inferno, Refs, VNode } from 'inferno';

declare global {
  interface Event {
    persist: Function;
  }
}

// React props that inferno-compat maps to Inferno ones (see normalizeGenericProps)
declare module 'inferno' {
  // Augmenting the Inferno namespace needs namespace syntax
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Inferno {
    interface StyleObjectTypes {
      camelCase: CamelCaseStyleObject;
    }

    interface DOMAttributes<T> {
      onDoubleClick?: MouseEventHandler<T> | undefined;
    }
  }
}

options.reactStyles = true;

function unmountComponentAtNode(
  container: Element | SVGAElement | DocumentFragment,
): boolean {
  renderInternal(null, container, null, {});
  return true;
}

export type IterateChildrenFn = (
  value: InfernoNode | any,
  index: number,
  array: any[],
) => any;

function flatten(arr, result): unknown[] {
  for (const value of arr) {
    if (isArray(value)) {
      flatten(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
}

const ARR: InfernoNode[] = [];

// Like React, the functions take a single child, an array of children, null or undefined
const Children = {
  map(
    children: InfernoNode,
    fn: IterateChildrenFn,
    ctx?: unknown,
  ): any[] | null | undefined {
    if (isNullOrUndef(children)) {
      return children;
    }
    const array = Children.toArray(children);
    if (ctx) {
      fn = fn.bind(ctx);
    }
    return array.map(fn);
  },
  forEach(children: InfernoNode, fn: IterateChildrenFn, ctx?: unknown): void {
    if (isNullOrUndef(children)) {
      return;
    }
    const array = Children.toArray(children);
    if (ctx) {
      fn = fn.bind(ctx);
    }
    for (let i = 0, len = array.length; i < len; ++i) {
      const child = isInvalid(array[i]) ? null : array[i];

      fn(child, i, array);
    }
  },
  count(children: InfernoNode): number {
    return Children.toArray(children).length;
  },
  only(children: InfernoNode): InfernoNode | any {
    const array = Children.toArray(children);
    if (array.length !== 1) {
      throw new Error('Children.only() expects only one child.');
    }
    return array[0];
  },
  toArray(children: InfernoNode): any[] {
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
  },
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
  week: true,
};

function normalizeGenericProps(props): void {
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

          newStyles[hyphenStr] = isNumber(value)
            ? getNumberStyleValue(hyphenStr, value)
            : value;
        }
        props.style = newStyles;
      }
    }
  }
}

function normalizeFormProps(name: string, props: any): void {
  if (
    (name === 'input' || name === 'textarea') &&
    props.type !== 'radio' &&
    props.onChange
  ) {
    const type = props.type?.toLowerCase();
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
Original event handler 'function ${existingMethod.name}' will not be called.`,
          );
        }
      }
      props[eventName] = props.onChange;
      props.onChange = void 0;
    }
  }
}

// we need to add persist() to Event (as React has it for synthetic events)
// this is a hack, and we really shouldn't be modifying a global object this way,
// but there isn't a performant way of doing this apart from trying to proxy
// every prop event that starts with "on", i.e. onClick or onKeyPress
// but in reality devs use onSomething for many things, not only for
// input events
if (typeof Event !== 'undefined') {
  const eventProtoType = Event.prototype as any;

  if (!eventProtoType.persist) {
    eventProtoType.persist = function () {};
  }
}

function iterableToArray(iterable): unknown[] {
  const tmpArr: any[] = [];
  for (const value of iterable) {
    tmpArr.push(value);
  }

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
  if (
    hasSymbolSupport &&
    !isNull(children) &&
    typeof children === 'object' &&
    !isArray(children) &&
    isFunction(children[symbolIterator])
  ) {
    vNode.children = iterableToArray(children);
  }

  if (!isNullOrUndef(children) && isNullOrUndef(props.children)) {
    props.children = children;
  }
  if (vNode.flags & VNodeFlags.Component) {
    if (isString(vNode.type)) {
      vNode.flags = getFlagsForElementVnode(vNode.type);
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
  if (a === b) {
    return false;
  }
  // A component without initial state has null state
  if (a === null || b === null) {
    return true;
  }
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

abstract class PureComponent<
  P = Record<string, unknown>,
  S = Record<string, unknown>,
> extends Component<P, S> {
  public shouldComponentUpdate(props, state): boolean {
    return (
      shallowDiffers(this.props, props) || shallowDiffers(this.state, state)
    );
  }
}

interface ContextProps {
  children?: InfernoNode;
  context: any;
}

class WrapperComponent<P, S> extends Component<P & ContextProps, S> {
  public getChildContext(): (P & ContextProps)['context'] {
    return this.props.context;
  }

  public render(props): InfernoNode {
    return props.children;
  }
}

// T is the class component that vNode renders
function unstable_renderSubtreeIntoContainer<
  T extends JSX.ElementClass = Component,
>(parentComponent, vNode, container, callback?: (this: T) => void): T {
  const wrapperVNode: VNode = createComponentVNode(
    VNodeFlags.ComponentClass,
    WrapperComponent,
    {
      children: vNode,
      context: parentComponent.context,
    },
  );
  render(wrapperVNode, container, null);
  const component = vNode.children;

  if (callback) {
    // callback gets the component as context, no other argument.
    callback.call(component);
  }
  return component;
}

// A createElement() with the type bound, the ref receives T
type ElementFactory<P, T> = (
  props?: (P & CreateElementProps<T>) | null,
  ...children: InfernoNode[]
) => VNode;

function createFactory<T extends Element = Element>(
  type: string,
): ElementFactory<Record<string, unknown>, T>;
function createFactory<P>(type: ComponentType<P>): ElementFactory<P, unknown>;
function createFactory(type) {
  return createElement.bind(null, type);
}

// Returns the root component instance, T is its class
function render<T extends JSX.ElementClass = Component>(
  rootInput,
  container,
  cb: (() => void) | null = null,
  context = EMPTY_OBJ,
): T | undefined {
  renderInternal(rootInput, container, cb, context);

  const input = container.$V;

  if (input && input.flags & VNodeFlags.Component) {
    return input.children;
  }

  return void 0;
}

// Mask React global in browser enviornments when React is not used.
if (
  typeof window !== 'undefined' &&
  typeof (window as any).React === 'undefined'
) {
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
    __render: renderInternal,
    // Public methods
    cloneElement: cloneVNode,
    cloneVNode,
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
    findDOMFromVNode,
    findDOMNode,
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
    version,
  };

  (window as any).React = exports;
  (window as any).ReactDOM = exports;
}

export {
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
  renderInternal,
  // Public methods
  cloneVNode as cloneElement,
  cloneVNode,
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
  findDOMFromVNode,
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
  version,
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
  __render: renderInternal,
  // Public methods
  cloneElement: cloneVNode,
  cloneVNode,
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
  findDOMFromVNode,
  findDOMNode,
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
  version,
};
