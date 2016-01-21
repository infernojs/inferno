import { getValueWithIndex } from '../core/variables';
import isArray from '../util/isArray';
import isStringOrNumber from '../util/isStringOrNumber';

function constructVirtualChildren(children, item) {
	if (isArray(children)) {
		let vChildren = new Array(children.length);
		for (let i = 0; i < children.length; i++) {
			const childNode = children[i];

			if (typeof childNode === 'object') {
				if (childNode.index !== undefined) {
					vChildren[i] = constructVirtualNode(getValueWithIndex(item, childNode.index), item);
				}
			} else {
				vChildren[i] = constructVirtualNode(childNode, item);
			}
		}
		return vChildren;
	} else if (typeof children === 'object') {
		if (children.index !== undefined) {
			return constructVirtualNode(getValueWithIndex(item, children.index), item);
		} else {
			return constructVirtualNode(children, item);
		}
	}
}

function constructVirtualNode(node, item) {
	let vNode;

	if (isStringOrNumber(node)) {
		return node;
	} else if (node && typeof node.tag === 'string') {
		vNode = {
			tag: node.tag,
			attrs: {},
		};
		if (node.attrs) {
			for (let attr in node.attrs) {
				const value = node.attrs[attr];

				if (value.index !== undefined) {
					vNode.attrs[attr] = getValueWithIndex(item, value.index);
				} else {
					vNode.attrs[attr] = value;
				}
			}
		}
		if (node.children) {
			vNode.children = constructVirtualChildren(node.children, item);
		}
	}
	return vNode;
}

export default function createTree(schema, isRoot, dynamicNodeMap) {
	return {
		create(item) {
			return constructVirtualNode(schema, item);
		},
		update() {

		},
		remove() {

		}
	};
}
