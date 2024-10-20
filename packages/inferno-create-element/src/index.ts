import {
  type Component,
  createComponentVNode,
  createFragment,
  createVNode,
  getFlagsForElementVnode,
  type Inferno,
  type Key,
  type Props,
  type Refs,
  type VNode,
} from 'inferno';
import {
  isInvalid,
  isNullOrUndef,
  isString,
  isUndefined,
} from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

export function createElement<P>(
  type:
    | string
    | Inferno.ComponentClass<P>
    | Inferno.StatelessComponent<P & Refs<P>>
    | typeof Component<P, any>,
  props?: (P & Props<P>) | null,
  ..._children: any[]
): VNode;
export function createElement<P>(
  type:
    | string
    | Inferno.ComponentClass<P>
    | Inferno.StatelessComponent<P & Refs<P>>
    | typeof Component<P, any>,
  props?: (P & Props<P>) | null,
  _children?: any,
): VNode {
  if (process.env.NODE_ENV !== 'production') {
    if (isInvalid(type)) {
      throw new Error(
        'Inferno Error: createElement() name parameter cannot be undefined, null, false or true, It must be a string, class, function or forwardRef.',
      );
    }
  }
  let children: any;
  let ref: any = null;
  let key: Key = null;
  let className: string | null = null;
  let flags: VNodeFlags;
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
    flags = getFlagsForElementVnode(type);

    if (!isNullOrUndef(props)) {
      newProps = {};

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
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        props = {} as P & Props<P>;
      }
      props.children = children;
    }

    if (!isNullOrUndef(props)) {
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
    }

    return createComponentVNode(flags, type, newProps, key, ref);
  }

  if (flags & VNodeFlags.Fragment) {
    return createFragment(
      childLen === 1 ? [children] : children,
      ChildFlags.UnknownChildren,
      key,
    );
  }

  return createVNode(
    flags,
    type,
    className,
    children,
    ChildFlags.UnknownChildren,
    newProps,
    key,
    ref,
  );
}
