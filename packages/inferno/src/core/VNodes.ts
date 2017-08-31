/**
 * @module Inferno
 */ /** TypeDoc Comment */

import {
  combineFrom,
  isArray,
  isInvalid,
  isNull,
  isStatefulComponent,
  isStringOrNumber,
  isUndefined
} from "inferno-shared";
import VNodeFlags from "inferno-vnode-flags";
import { EMPTY_OBJ } from "../DOM/utils";
import { normalize } from "./normalization";
import { options } from "./options";

export type InfernoInput = VNode | null | string | number;
export type Ref = (node?: Element | null) => void;
export type InfernoChildren =
  | string
  | number
  | boolean
  | undefined
  | VNode
  | Array<string | number | VNode>
  | null;
export type Type = string | null | Function;

export interface Props {
  children?: InfernoChildren;
  ref?: Ref | null;
  key?: any;
  className?: string;
  [k: string]: any;
}

export interface Refs {
  onComponentDidMount?: (domNode: Element) => void;
  onComponentWillMount?(): void;
  onComponentShouldUpdate?(lastProps, nextProps): boolean;
  onComponentWillUpdate?(lastProps, nextProps): void;
  onComponentDidUpdate?(lastProps, nextProps): void;
  onComponentWillUnmount?(domNode: Element): void;
}

export interface VNode {
  children: InfernoChildren;
  dom: Element | null;
  className: string | null;
  flags: number;
  key: any;
  props: Props | null;
  ref: Ref | null;
  type: Type;
  parentVNode?: VNode;
}

/**
 * Creates virtual node
 * @param {number} flags
 * @param {string|Function|null} type
 * @param {string|null=} className
 * @param {object=} children
 * @param {object=} props
 * @param {*=} key
 * @param {object|Function=} ref
 * @param {boolean=} noNormalise
 * @returns {VNode} returns new virtual node
 */
export function createVNode(
  flags: number,
  type: Type,
  className?: string | null,
  children?: InfernoChildren,
  props?: Props | null,
  key?: any,
  ref?: Ref | null,
  noNormalise?: boolean
): VNode {
  if (flags & VNodeFlags.ComponentUnknown) {
    flags = isStatefulComponent(type)
      ? VNodeFlags.ComponentClass
      : VNodeFlags.ComponentFunction;
  }

  const vNode: VNode = {
    children: children === void 0 ? null : children,
    className: className === void 0 ? null : className,
    dom: null,
    flags,
    key: key === void 0 ? null : key,
    props: props === void 0 ? null : props,
    ref: ref === void 0 ? null : ref,
    type
  };
  if (noNormalise !== true) {
    normalize(vNode);
  }
  if (options.createVNode !== null) {
    options.createVNode(vNode);
  }

  return vNode;
}

export function directClone(vNodeToClone: VNode): VNode {
  let newVNode;
  const flags = vNodeToClone.flags;

  if (flags & VNodeFlags.Component) {
    let props;
    const propsToClone = vNodeToClone.props;

    if (isNull(propsToClone)) {
      props = EMPTY_OBJ;
    } else {
      props = {};
      for (const key in propsToClone) {
        props[key] = propsToClone[key];
      }
    }
    newVNode = createVNode(
      flags,
      vNodeToClone.type,
      null,
      null,
      props,
      vNodeToClone.key,
      vNodeToClone.ref,
      true
    );
    const newProps = newVNode.props;

    const newChildren = newProps.children;
    // we need to also clone component children that are in props
    // as the children may also have been hoisted
    if (newChildren) {
      if (isArray(newChildren)) {
        const len = newChildren.length;
        if (len > 0) {
          const tmpArray: InfernoChildren = [];

          for (let i = 0; i < len; i++) {
            const child = newChildren[i];

            if (isStringOrNumber(child)) {
              tmpArray.push(child);
            } else if (!isInvalid(child) && isVNode(child)) {
              tmpArray.push(directClone(child));
            }
          }
          newProps.children = tmpArray;
        }
      } else if (isVNode(newChildren)) {
        newProps.children = directClone(newChildren);
      }
    }

    newVNode.children = null;
  } else if (flags & VNodeFlags.Element) {
    const children = vNodeToClone.children;
    let props;
    const propsToClone = vNodeToClone.props;

    if (propsToClone === null) {
      props = EMPTY_OBJ;
    } else {
      props = {};
      for (const key in propsToClone) {
        props[key] = propsToClone[key];
      }
    }
    newVNode = createVNode(
      flags,
      vNodeToClone.type,
      vNodeToClone.className,
      children,
      props,
      vNodeToClone.key,
      vNodeToClone.ref,
      !children
    );
  } else if (flags & VNodeFlags.Text) {
    newVNode = createTextVNode(
      vNodeToClone.children as string,
      vNodeToClone.key
    );
  }

  return newVNode;
}

/*
 directClone is preferred over cloneVNode and used internally also.
 This function makes Inferno backwards compatible.
 And can be tree-shaked by modern bundlers

 Would be nice to combine this with directClone but could not do it without breaking change
 */

/**
 * Clones given virtual node by creating new instance of it
 * @param {VNode} vNodeToClone virtual node to be cloned
 * @param {Props=} props additional props for new virtual node
 * @param {...*} _children new children for new virtual node
 * @returns {VNode} new virtual node
 */
export function cloneVNode(
  vNodeToClone: VNode,
  props?: Props,
  ..._children: InfernoChildren[]
): VNode {
  let children: any = _children;
  const childrenLen = _children.length;

  if (childrenLen > 0 && !isUndefined(_children[0])) {
    if (!props) {
      props = {};
    }
    if (childrenLen === 1) {
      children = _children[0];
    }

    if (!isUndefined(children)) {
      props.children = children as VNode;
    }
  }

  let newVNode;

  if (isArray(vNodeToClone)) {
    const tmpArray: InfernoChildren = [];
    for (let i = 0, len = (vNodeToClone as any).length; i < len; i++) {
      tmpArray.push(directClone(vNodeToClone[i]));
    }

    newVNode = tmpArray;
  } else {
    const flags = vNodeToClone.flags;
    let className = vNodeToClone.className;
    let key = vNodeToClone.key;
    let ref = vNodeToClone.ref;
    if (props) {
      if (props.hasOwnProperty("className")) {
        className = props.className as string;
      }
      if (props.hasOwnProperty("ref")) {
        ref = props.ref as Ref;
      }

      if (props.hasOwnProperty("key")) {
        key = props.key;
      }
    }

    if (flags & VNodeFlags.Component) {
      newVNode = createVNode(
        flags,
        vNodeToClone.type,
        className,
        null,
        !vNodeToClone.props && !props
          ? EMPTY_OBJ
          : combineFrom(vNodeToClone.props, props),
        key,
        ref,
        true
      );
      const newProps = newVNode.props;

      if (newProps) {
        const newChildren = newProps.children;
        // we need to also clone component children that are in props
        // as the children may also have been hoisted
        if (newChildren) {
          if (isArray(newChildren)) {
            const len = newChildren.length;
            if (len > 0) {
              const tmpArray: InfernoChildren = [];

              for (let i = 0; i < len; i++) {
                const child = newChildren[i];

                if (isStringOrNumber(child)) {
                  tmpArray.push(child);
                } else if (!isInvalid(child) && isVNode(child)) {
                  tmpArray.push(directClone(child));
                }
              }
              newProps.children = tmpArray;
            }
          } else if (isVNode(newChildren)) {
            newProps.children = directClone(newChildren);
          }
        }
      }
      newVNode.children = null;
    } else if (flags & VNodeFlags.Element) {
      children =
        props && !isUndefined(props.children)
          ? props.children
          : vNodeToClone.children;
      newVNode = createVNode(
        flags,
        vNodeToClone.type,
        className,
        children,
        !vNodeToClone.props && !props
          ? EMPTY_OBJ
          : combineFrom(vNodeToClone.props, props),
        key,
        ref,
        false
      );
    } else if (flags & VNodeFlags.Text) {
      newVNode = createTextVNode(vNodeToClone.children as string, key);
    }
  }
  return newVNode;
}

export function createVoidVNode(): VNode {
  return createVNode(VNodeFlags.Void, null);
}

export function createTextVNode(text: string | number, key): VNode {
  return createVNode(VNodeFlags.Text, null, null, text, null, key);
}

export function isVNode(o: VNode): boolean {
  return !!o.flags;
}
