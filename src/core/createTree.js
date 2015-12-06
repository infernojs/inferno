import createRootNodeWithDynamicText from '../shapes/rootNodeWithDynamicText';
import createRootNodeWithDynamicChildren from '../shapes/rootNodeWithDynamicChildren';
import createRootStaticNode from '../shapes/rootStaticNode';
import { ObjectTypes } from './variables';
import isArray from '../util/isArray';

function createStaticAttributes(node) {
	if (node.attrs != null) {
		for (let attr in node.attrs) {
			
		}
	}
}

function createStaticTreeChildren(children, parentNode) {
	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const childItem = children[i];
			createStaticNode(childItem, parentNode);
		}
	} else {
		createStaticNode(children, parentNode);
	}
}

function createStaticNode(node, parentNode) {
	const tag = node.tag;

	if (tag) {
		const staticNode = document.createElement(tag);
		const text = node.text;

		if (text != null) {
			staticNode.textContent = text;
		} else {
			const children = node.children;
			createStaticTreeChildren(children, staticNode);
		}
		createStaticAttributes(staticNode);
		parentNode.appendChild(staticNode);
	}
}

export default function createTree(schema, isRoot) {
	let node;

	if (typeof schema === 'string') {
		// TODO
	} else if (schema.type) {
		// TODO
	} else {
		const tag = schema.tag;

		if(tag) {
			const templateNode = document.createElement(tag);
			const text = schema.text;

			if (text != null) {
				if (text.type === ObjectTypes.VARIABLE) {
					if (isRoot) {
						node = createRootNodeWithDynamicText(templateNode, text.index);
					}
				} else {
					// TODO check if text is empty
					if (text != null) {
						templateNode.textContent = text;
					}
					if (isRoot) {
						node = createRootStaticNode(templateNode);
					}
				}
			} else {
				const children = schema.children;

				if (children != null) {
					if (children.type === ObjectTypes.VARIABLE) {
						if (isRoot) {
							node = createRootNodeWithDynamicChildren(templateNode, children.index);
						}
					} else {
						createStaticTreeChildren(children, templateNode);
						if (isRoot) {
							node = createRootStaticNode(templateNode, children);
						}
					}
				} else {
					createStaticAttributes(templateNode);
					if (isRoot) {
						node = createRootStaticNode(templateNode, children);
					}
				}
			}
		}
	}
	return node;
}
