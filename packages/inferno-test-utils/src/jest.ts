import { render, VNode } from 'inferno';
import { isArray, isNull, isObject, isString } from 'inferno-shared';
import { getTagNameOfVNode, isDOMVNode } from './utils';

// Jest Snapshot Utilities
// Jest formats it's snapshots prettily because it knows how to play with the React test renderer.
// Symbols and algorithm have been reversed from the following file:
// https://github.com/facebook/react/blob/v15.4.2/src/renderers/testing/ReactTestRenderer.js#L98

function createSnapshotObject(object: object) {
  let value;
  if (typeof Symbol === 'undefined') {
    value = 'react.test.json';
  } else {
    value = Symbol.for('react.test.json');
  }

  Object.defineProperty(object, '$$typeof', {
    value
  });

  return object;
}

export function vNodeToSnapshot(node: VNode|Element) {
  let object;
  const children: any[] = [];
  if (isDOMVNode(node)) {
    const props = { className: node.className || undefined, ...node.props };

    // Remove undefined props
    Object.keys(props).forEach(propKey => {
      if (props[propKey] === undefined) {
        delete props[propKey];
      }
    });

    // Create the actual object that Jest will interpret as the snapshot for this VNode
    object = createSnapshotObject({
      props,
      type: getTagNameOfVNode(node)
    });
  }

  if (isArray(node.children)) {
    node.children.forEach(child => {
      const asJSON = vNodeToSnapshot(child as VNode);
      if (asJSON) {
        children.push(asJSON);
      }
    });
  } else if (isString(node.children)) {
    children.push(node.children);
  } else if (isObject(node.children) && !isNull(node.children)) {
    const asJSON = vNodeToSnapshot(node.children as any);
    if (asJSON) {
      children.push(asJSON);
    }
  }

  if (object) {
    object.children = children.length ? children : null;
    return object;
  }

  if (children.length > 1) {
    return children;
  } else if (children.length === 1) {
    return children[0];
  }

  return object;
}

export function renderToSnapshot(input: VNode) {
  render(input, document.createElement('div'));
  const snapshot = vNodeToSnapshot(input);

  delete snapshot.props.children;
  return snapshot;
}
