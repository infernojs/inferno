/**
 * @module Inferno-Clone-VNode
 */ /** TypeDoc Comment */

import {
  createTextVNode,
  createVNode,
  directClone,
  normalize,
  normalizeProps,
  EMPTY_OBJ,
  VNode
} from 'inferno';
import {
  combineFrom,
  isUndefined,
  isStringOrNumber,
  isInvalid,
  isArray
} from 'inferno-shared';
import { VNodeFlags } from 'inferno-vnode-flags';

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
export function cloneVNode(vNodeToClone: VNode, props?, ..._children): VNode {
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
    const tmpArray: any[] = [];
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
      if (!isUndefined(props.className)) {
        className = props.className as string;
      }
      if (!isUndefined(props.ref)) {
        ref = props.ref;
      }

      if (!isUndefined(props.key)) {
        key = props.key;
      }
    }

    if (flags & VNodeFlags.Component) {
      newVNode = createVNode(
        flags,
        vNodeToClone.type,
        null,
        null,
        !vNodeToClone.props && !props
          ? EMPTY_OBJ
          : combineFrom(vNodeToClone.props, props),
        key,
        ref
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
              const tmpArray: any[] = [];

              for (let i = 0; i < len; i++) {
                const child = newChildren[i];

                if (isStringOrNumber(child)) {
                  tmpArray.push(child);
                } else if (!isInvalid(child) && child.flags) {
                  tmpArray.push(directClone(child));
                }
              }
              newProps.children = tmpArray;
            }
          } else if (newChildren.flags) {
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
        normalize(children),
        !vNodeToClone.props && !props
          ? EMPTY_OBJ
          : combineFrom(vNodeToClone.props, props),
        key,
        ref
      );
    } else if (flags & VNodeFlags.Text) {
      newVNode = createTextVNode(vNodeToClone.children);
    }
  }
  return normalizeProps(newVNode);
}
