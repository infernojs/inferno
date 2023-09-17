import { render, rerender, type VNode } from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { isArray, isNullOrUndef } from 'inferno-shared';
import { getTagNameOfVNode } from './utils';

// Jest Snapshot Utilities
// Jest formats its snapshots prettily because it knows how to play with the React test renderer.
// Symbols and algorithm have been reversed from the following file:
// https://github.com/facebook/react/blob/v15.4.2/src/renderers/testing/ReactTestRenderer.js#L98

const symbolValue =
  typeof Symbol === 'undefined'
    ? 'react.test.json'
    : Symbol.for('react.test.json');

function createSnapshotObject(object: object): object {
  Object.defineProperty(object, '$$typeof', {
    value: symbolValue,
  });

  return object;
}

function removeChildren(item): void {
  if (Array.isArray(item)) {
    for (let i = 0; i < item.length; ++i) {
      removeChildren(item[i]);
    }
  } else if (item?.props) {
    if (Object.prototype.hasOwnProperty.call(item.props, 'children')) {
      delete item.props.children;
    }

    removeChildren(item.children);
  }
}

function buildVNodeSnapshot(vNode: VNode): unknown {
  const flags = vNode.flags;
  const children: any = vNode.children;
  let childVNode;

  if (flags & VNodeFlags.ComponentClass) {
    childVNode = buildVNodeSnapshot(children.$LI);
  } else if (flags & VNodeFlags.ComponentFunction) {
    childVNode = buildVNodeSnapshot(children);
  }

  if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
    childVNode = buildVNodeSnapshot(children);
  } else if (vNode.childFlags & ChildFlags.MultipleChildren) {
    childVNode = [];

    for (let i = 0, len = children.length; i < len; ++i) {
      childVNode.push(buildVNodeSnapshot(children[i]));
    }
  } else if (vNode.childFlags & ChildFlags.HasTextChildren) {
    childVNode = (vNode.children as string | number) + '';
  }

  if (flags & VNodeFlags.Element) {
    const snapShotProps: any = {};
    const props = vNode.props;

    if (props) {
      const keys = Object.keys(props);

      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        const value = props[key];

        if (value !== undefined) {
          snapShotProps[key] = value;
        }
      }
    }

    if (!isNullOrUndef(vNode.className)) {
      snapShotProps.className = vNode.className;
    }

    // Jest expects children to always be an array
    if (childVNode && !isArray(childVNode)) {
      childVNode = [childVNode];
    }

    return createSnapshotObject({
      children: childVNode,
      props: snapShotProps,
      type: getTagNameOfVNode(vNode),
    });
  } else if (flags & VNodeFlags.Text) {
    childVNode = (vNode.children as string | number) + '';
  }

  return childVNode;
}

export function vNodeToSnapshot(vNode: VNode): unknown {
  return buildVNodeSnapshot(vNode);
}

export function renderToSnapshot(input: VNode): unknown {
  render(input, document.createElement('div'));
  rerender(); // Flush all pending set state calls
  const snapshot = vNodeToSnapshot(input);

  removeChildren(snapshot);

  return snapshot;
}
