import { createComponentVNode, createTextVNode, createVNode, directClone, EMPTY_OBJ, normalizeProps, VNode } from 'inferno';
import { combineFrom, isArray, isInvalid, isStringOrNumber, flatten } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

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
 * @returns {VNode} new virtual node
 */
export function cloneVNode(vNodeToClone: VNode, props?): VNode {
  let children: any;
  if (props && props.children) {
    children = props.children;
  }

  const childLen = arguments.length - 2;
  if (childLen === 1) {
    children = arguments[2];
  } else if (childLen > 1) {
    const [, , ...childArgs] = [...arguments];
    children = childArgs;
  } else if (children == null) {
    const existingChildren = (vNodeToClone.props && vNodeToClone.props.children)
      ? vNodeToClone.props.children
      : vNodeToClone.children;

    children = (Array.isArray(existingChildren) && existingChildren.length > 0) 
      ? flatten(existingChildren) 
      : existingChildren;
  } 

  props = props || {};
  props.children = children;

  let newVNode;
  const flags = vNodeToClone.flags;
  let className = vNodeToClone.className;
  let key = vNodeToClone.key;
  let ref = vNodeToClone.ref;
  if (props) {
    if (props.className !== void 0) {
      className = props.className as string;
    }
    if (props.ref !== void 0) {
      ref = props.ref;
    }

    if (props.key !== void 0) {
      key = props.key;
    }
  }

  if (flags & VNodeFlags.Component) {
    newVNode = createComponentVNode(flags, vNodeToClone.type, !vNodeToClone.props && !props ? EMPTY_OBJ : combineFrom(vNodeToClone.props, props), key, ref);
    const newProps = newVNode.props;
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
    newVNode.children = null;
  } else if (flags & VNodeFlags.Element) {
    if (!props) {
      props = {
        children: vNodeToClone.children
      };
    }
    newVNode = createVNode(flags, vNodeToClone.type, className, null, ChildFlags.HasInvalidChildren, combineFrom(vNodeToClone.props, props), key, ref);
  } else if (flags & VNodeFlags.Text) {
    return createTextVNode(props ? props.children : (vNodeToClone.children as string));
  }

  return normalizeProps(newVNode);
}
