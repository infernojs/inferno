import { isArray, isInvalid, isNullOrUndef, throwError } from 'inferno-shared';
import { VNodeFlags, ChildFlags } from 'inferno-vnode-flags';
import { isVNode } from './implementation';

function getTagName(vNode) {
  const flags = vNode.flags;
  let tagName;

  if (flags & VNodeFlags.Element) {
    tagName = `<${vNode.type}${
      vNode.className ? ' class="' + vNode.className + '"' : ''
    }>`;
  } else {
    const componentName =
      vNode.type.name || vNode.type.displayName || vNode.type.constructor.name;

    tagName = `<${componentName} />`;
  }

  return tagName;
}

function DEV_ValidateKeys(vNodeTree, vNode, forceKeyed) {
  const foundKeys = new Set();

  for (let i = 0, len = vNodeTree.length; i < len; i++) {
    const childNode = vNodeTree[i];

    if (isArray(childNode)) {
      return (
        'Encountered ARRAY in mount, array must be flattened, or normalize used. Location: ' +
        getTagName(childNode)
      );
    }

    if (isInvalid(childNode)) {
      if (forceKeyed) {
        return (
          'Encountered invalid node when preparing to keyed algorithm. Location: ' +
          getTagName(childNode)
        );
      } else if (foundKeys.size !== 0) {
        return (
          'Encountered invalid node with mixed keys. Location: ' +
          getTagName(childNode)
        );
      }
      continue;
    }
    const key = childNode.key;
    const children = childNode.children;
    if (!isInvalid(children)) {
      let val;
      if (isArray(children)) {
        val = DEV_ValidateKeys(children, childNode, forceKeyed);
      } else if (isVNode(children)) {
        val = DEV_ValidateKeys(
          [children],
          childNode,
          forceKeyed || childNode.childFlags & ChildFlags.HasKeyedChildren
        );
      }
      if (val) {
        val += ' :: ' + getTagName(childNode);

        return val;
      }
    }
    if (forceKeyed && isNullOrUndef(key)) {
      return (
        'Encountered child vNode without key during keyed algorithm. Location: ' +
        getTagName(childNode)
      );
    } else if (!forceKeyed && isNullOrUndef(key)) {
      if (foundKeys.size !== 0) {
        return (
          'Encountered children with key missing. Location: ' +
          getTagName(childNode)
        );
      }
      continue;
    }
    if (foundKeys.has(key)) {
      return (
        'Encountered two children with same key: {' +
        key +
        '}. Location: ' +
        getTagName(childNode)
      );
    }
    foundKeys.add(key);
  }
}

export function validateKeys(vNode, forceKeyed) {
  if (process.env.NODE_ENV !== 'production') {
    let error;
    // Checks if there is any key missing or duplicate keys
    if (
      vNode.props &&
      vNode.props.children &&
      vNode.flags & VNodeFlags.Component
    ) {
      error = DEV_ValidateKeys(vNode.props.children, vNode, forceKeyed);
    } else if (vNode.children && vNode.flags & VNodeFlags.Element) {
      error = DEV_ValidateKeys(vNode.children, vNode, forceKeyed);
    }

    if (error) {
      throwError(error + ' :: ' + getTagName(vNode));
    }
  }
}
