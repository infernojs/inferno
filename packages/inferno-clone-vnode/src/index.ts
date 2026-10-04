import {
  newComponentVNode,
  newFragment,
  newTextVNode,
  newVNode,
  normalizeProps,
  type VNode,
} from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';

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
  }

  if (childLen === 1) {
    children = childArgs[0];
  } else if (childLen > 1) {
    children = [];

    for (let i = 0, len = childArgs.length; i < len; ++i) {
      const child = childArgs[i];
      children.push(child);
    }
  }

  // The props passed in are not changed, they may be shared between clones
  if (flags & VNodeFlags.Component) {
    return newComponentVNode(
      // The clone's flags must not keep the children's shape or the validation of vNodeToClone
      (flags & VNodeFlags.ClearOnCopy) | VNodeFlags.HasInvalidChildren,
      vNodeToClone.type,
      { ...vNodeToClone.props, ...props, children },
      key,
      ref,
    );
  }

  if (flags & VNodeFlags.Text) {
    return newTextVNode(children);
  }

  if (flags & VNodeFlags.Fragment) {
    // No child bit, the children are normalized
    return newFragment(
      VNodeFlags.Fragment,
      childLen === 1 ? [children] : children,
      key,
    );
  }

  return normalizeProps(
    newVNode(
      // normalizeProps sets the children from props
      (flags & VNodeFlags.ClearOnCopy) | VNodeFlags.HasInvalidChildren,
      vNodeToClone.type,
      className,
      null,
      { ...vNodeToClone.props, ...props, children },
      key,
      ref,
    ),
  );
}
