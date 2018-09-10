import { render, VNode } from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { isArray, isNullOrUndef } from 'inferno-shared';
import { getTagNameOfVNode } from './utils';

// Jest Snapshot Utilities
// Jest formats it's snapshots prettily because it knows how to play with the React test renderer.
// Symbols and algorithm have been reversed from the following file:
// https://github.com/facebook/react/blob/v15.4.2/src/renderers/testing/ReactTestRenderer.js#L98

const symbolValue = typeof Symbol === 'undefined' ? 'react.test.json' : Symbol.for('react.test.json');

function createSnapshotObject(object: object) {
  Object.defineProperty(object, '$$typeof', {
    value: symbolValue
  });

  return object;
}

function buildVNodeSnapshot(vNode: VNode) {
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

    for (let i = 0, len = children.length; i < len; i++) {
      childVNode.push(buildVNodeSnapshot(children[i]));
    }
  }

  if (flags & VNodeFlags.Element) {
    const snapShotProps: any = {};
    const props = vNode.props;

    if (props) {
      const keys = Object.keys(props);

      for (let i = 0; i < keys.length; i++) {
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

    // Jest expects children to always be array
    if (childVNode && !isArray(childVNode)) {
      childVNode = [childVNode];
    }

    return createSnapshotObject({
      children: childVNode,
      props: snapShotProps,
      type: getTagNameOfVNode(vNode),
    });
  } else if (flags & VNodeFlags.Text) {
    childVNode = vNode.children + '';
  }

  return childVNode;
}

export function vNodeToSnapshot(vNode: VNode) {
  return buildVNodeSnapshot(vNode);
}

export function renderToSnapshot(input: VNode) {
  render(input, document.createElement('div'));
  const snapshot = vNodeToSnapshot(input);

  delete snapshot.props.children;
  return snapshot;
}
