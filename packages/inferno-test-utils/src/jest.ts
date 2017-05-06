import { VNode } from 'inferno';
import { isArray, isNull, isObject, isString } from 'inferno-shared';
import { getTagNameOfVNode, isDOMVNode, renderIntoDocument } from './index';

// Jest Snapshot Utilities
// Jest formats it's snapshots prettily because it knows how to play with the React test renderer.
// Symbols and algorithm have been reversed from the following file:
// https://github.com/facebook/react/blob/v15.4.2/src/renderers/testing/ReactTestRenderer.js#L98

function createSnapshotObject(object: object) {
	Object.defineProperty(object, '$$typeof', {
		value: Symbol.for('react.test.json')
	});

	return object;
}

export function vNodeToSnapshot(node: VNode) {
	let object;
	const children: any[] = [];

	if (isDOMVNode(node)) {
		const props = { ...node.props };

		// Remove undefined props
		Object.keys(props).forEach(propKey => {
			if (props[propKey] === undefined) {
				delete props[propKey];
			}
		});

		// Create the actual object that Jest will interpret as the snapshot for this VNode
		object = createSnapshotObject({
			type: getTagNameOfVNode(node),
			props
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
		const asJSON = vNodeToSnapshot(node.children);
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
	const vnode = renderIntoDocument(input) as VNode;

	if (!isNull(vnode.props)) {
		const snapshot = vNodeToSnapshot(vnode.props.children as VNode);
		delete snapshot.props.children;
		return snapshot;
	}

	return undefined;
}

export default {
	createSnapshotObject,
	vNodeToSnapshot,
	renderToSnapshot
};
