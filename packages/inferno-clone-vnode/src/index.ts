import {
  createComponentVNode,
  createFragment,
  createTextVNode,
  createVNode,
  EMPTY_OBJ,
  normalizeProps,
  type VNode,
} from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

/*
 directClone is preferred over cloneVNode and used internally also.
 This function makes Inferno backwards compatible.
 And can be tree-shaked by modern bundlers
*/

/**
 * Clones given virtual node by creating new instance of it
 * @param {VNode} vNodeToClone virtual node to be cloned
 * @param {Props=} props additional props for new virtual node
 * @param {...*} childArgs new children for new virtual node
 * @returns {VNode} new virtual node
 */
export function cloneVNode(vNodeToClone: VNode, props?, ...childArgs): VNode {
  const flags = vNodeToClone.flags;
  let children =
    flags & VNodeFlags.Component
      ? vNodeToClone.props?.children
      : vNodeToClone.children;
  const childLen = childArgs.length;
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
    if (props.children !== void 0) {
      children = props.children;
    }
  } else {
    props = {};
  }

  if (childLen === 1) {
    children = childArgs[0];
  } else if (childLen > 1) {
    children = [];

    for (let i = 0; i < childLen; i++) {
      children.push(childArgs[i]);
    }
  }

  props.children = children;

  if (flags & VNodeFlags.Component) {
    return createComponentVNode(
      flags,
      vNodeToClone.type,
      !vNodeToClone.props && !props
        ? EMPTY_OBJ
        : { ...vNodeToClone.props, ...props },
      key,
      ref,
    );
  }

  if (flags & VNodeFlags.Text) {
    return createTextVNode(children);
  }

  if (flags & VNodeFlags.Fragment) {
    return createFragment(
      childLen === 1 ? [children] : children,
      ChildFlags.UnknownChildren,
      key,
    );
  }

  return normalizeProps(
    createVNode(
      flags,
      vNodeToClone.type,
      className,
      null,
      ChildFlags.HasInvalidChildren,
      { ...vNodeToClone.props, ...props },
      key,
      ref,
    ),
  );
}
