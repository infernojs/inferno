import {
  type Component,
  getFlagsForElementVnode,
  type Inferno,
  type InfernoNode,
  type Key,
  newComponentVNode,
  newFragment,
  newVNode,
  type Ref,
  type RefObject,
  type Refs,
  type VNode,
} from 'inferno';
import {
  isInvalid,
  isNullOrUndef,
  isString,
  isUndefined,
} from 'inferno-shared';
import { VNodeFlags } from 'inferno-vnode-flags';

// The props that createElement handles itself, the ref receives T
export interface CreateElementProps<T> {
  children?: InfernoNode;
  key?: Key;
  ref?: Ref<T> | RefObject<T> | null;
}

// Function components can also take their lifecycle hooks as props, see Refs
export interface CreateFunctionElementProps<P>
  extends Omit<CreateElementProps<unknown>, 'ref'>, Refs<P> {
  ref?: Ref<unknown> | RefObject<unknown> | Refs<P> | null;
}

// DOM elements, the ref receives the element
export function createElement<P, T extends Element = Element>(
  type: string,
  props?: (P & CreateElementProps<T>) | null,
  ...children: any[]
): VNode;
// Function components and forwardRef components
export function createElement<P>(
  type: Inferno.StatelessComponent<P & Refs<P>>,
  props?: (P & CreateFunctionElementProps<P>) | null,
  ...children: any[]
): VNode;
// Class components, the ref receives the component instance
export function createElement<P>(
  type: Inferno.ComponentClass<P> | typeof Component<P, any>,
  props?: (P & CreateElementProps<unknown>) | null,
  ...children: any[]
): VNode;
export function createElement<P>(
  type:
    | string
    | Inferno.ComponentClass<P>
    | Inferno.StatelessComponent<P & Refs<P>>
    | typeof Component<P, any>,
  props?: (P & CreateElementProps<unknown> & Refs<P>) | null,
  ...children: any[]
): VNode {
  if (process.env.NODE_ENV !== 'production') {
    if (isInvalid(type)) {
      throw new Error(
        'Inferno Error: createElement() name parameter cannot be undefined, null, false or true, It must be a string, class, function or forwardRef.',
      );
    }
  }
  let definedChildren: any;
  let ref: any = null;
  let key: Key = null;
  let className: string | null = null;
  let flags: VNodeFlags;
  let newProps: Readonly<unknown> | null | undefined;
  const childLen = children.length;

  if (childLen === 1) {
    definedChildren = children[0];
  } else if (childLen > 1) {
    definedChildren = [];

    for (let i = 0, len = children.length; i < len; ++i) {
      const child = children[i];
      definedChildren.push(child);
    }
  }
  if (isString(type)) {
    flags = getFlagsForElementVnode(type);

    if (!isNullOrUndef(props)) {
      newProps = {};

      for (const prop in props) {
        if (prop === 'className' || prop === 'class') {
          className = (props as any)[prop];
        } else if (prop === 'key') {
          key = props.key;
        } else if (prop === 'children' && isUndefined(definedChildren)) {
          definedChildren = props.children; // always favour children args over props
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

    if (!isNullOrUndef(props) || !isUndefined(definedChildren)) {
      newProps = {};

      for (const prop in props) {
        if (prop === 'key') {
          key = props.key;
        } else if (prop === 'ref') {
          ref = props.ref;
        } else {
          switch (prop) {
            case 'onComponentDidAppear':
            case 'onComponentDidMount':
            case 'onComponentDidUpdate':
            case 'onComponentShouldUpdate':
            case 'onComponentWillDisappear':
            case 'onComponentWillMount':
            case 'onComponentWillMove':
            case 'onComponentWillUnmount':
            case 'onComponentWillUpdate':
              if (!ref) {
                ref = {};
              }
              ref[prop] = props[prop];
              break;
            default:
              newProps[prop] = props[prop];
              break;
          }
        }
      }
      if (!isUndefined(definedChildren)) {
        (newProps as Record<string, unknown>).children = definedChildren;
      }
    }

    return newComponentVNode(flags, type, newProps, key, ref);
  }

  // The flags have no child bit, the children are normalized
  if (flags & VNodeFlags.Fragment) {
    return newFragment(
      VNodeFlags.Fragment,
      childLen === 1 ? [definedChildren] : definedChildren,
      key,
    );
  }

  return newVNode(flags, type, className, definedChildren, newProps, key, ref);
}
