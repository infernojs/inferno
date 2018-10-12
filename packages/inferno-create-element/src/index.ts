import { Component, createComponentVNode, createVNode, getFlagsForElementVnode, Key, Props, VNode, createFragment } from 'inferno';
import { isInvalid, isNullOrUndef, isString, isUndefined } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

const componentHooks = {
  onComponentDidMount: 1,
  onComponentDidUpdate: 1,
  onComponentShouldUpdate: 1,
  onComponentWillMount: 1,
  onComponentWillUnmount: 1,
  onComponentWillUpdate: 1
};

/**
 * Creates virtual node
 * @param {string|Function|Component<any, any>} type Type of node
 * @param {object=} props Optional props for virtual node
 * @param {...{object}=} _children Optional children for virtual node
 * @returns {VNode} new virtual ndoe
 */
export function createElement<T>(type: string | Function | Component<any, any>, props?: T & Props<T> | null, _children?: any): VNode {
  if (process.env.NODE_ENV !== 'production') {
    if (isInvalid(type)) {
      throw new Error(
        'Inferno Error: createElement() name parameter cannot be undefined, null, false or true, It must be a string, class, function or forwardRef.'
      );
    }
  }
  let children: any;
  let ref: any = null;
  let key: Key = null;
  let className: string | null = null;
  let flags: VNodeFlags = 0;
  let newProps;
  let childLen = arguments.length - 2;

  if (childLen === 1) {
    children = _children;
  } else if (childLen > 1) {
    children = [];

    while (childLen-- > 0) {
      children[childLen] = arguments[childLen + 2];
    }
  }
  if (isString(type)) {
    flags = getFlagsForElementVnode(type as string);

    if (!isNullOrUndef(props)) {
      newProps = {} as T & Props<T>;

      for (const prop in props) {
        if (prop === 'className' || prop === 'class') {
          className = (props as any)[prop];
        } else if (prop === 'key') {
          key = props.key;
        } else if (prop === 'children' && isUndefined(children)) {
          children = props.children; // always favour children args over props
        } else if (prop === 'ref') {
          ref = props.ref;
        } else {
          if (prop === 'contenteditable') {
            flags |= VNodeFlags.ContentEditable;
          }
          newProps[prop] = props[prop];
        }
      }
    }
  } else {
    flags = VNodeFlags.ComponentUnknown;
    if (!isUndefined(children)) {
      if (!props) {
        props = {} as T;
      }
      props.children = children;
      children = null;
    }

    if (!isNullOrUndef(props)) {
      newProps = {} as T & Props<T>;

      for (const prop in props) {
        if ((componentHooks as any)[prop] === 1) {
          if (!ref) {
            ref = {};
          }
          ref[prop] = props[prop];
        } else if (prop === 'key') {
          key = props.key;
        } else if (prop === 'ref') {
          ref = props.ref;
        } else {
          newProps[prop] = props[prop];
        }
      }
    }

    return createComponentVNode(flags, type as Function, newProps, key, ref);
  }

  if (flags & VNodeFlags.Fragment) {
    return createFragment(childLen === 1 ? [children] : children, ChildFlags.UnknownChildren, key);
  }

  return createVNode(flags, type as string, className, children, ChildFlags.UnknownChildren, newProps, key, ref);
}
