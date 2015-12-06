import createRootNodeWithDynamicText from '../shapes/rootNodeWithDynamicText';
import createRootNodeWithDynamicChildren from '../shapes/rootNodeWithDynamicChildren';
import createRootStaticNode from '../shapes/rootStaticNode';
import { ObjectTypes } from './variables';
import isArray from '../util/isArray';
import addDOMAttributes from '../DOM/addAttributes';

function createStaticAttributes(node, domNode, isDOM) {
	if (node.attrs != null) {
		if (isDOM) {
			addDOMAttributes(node, domNode, node.attrs);
		}
	}
}

function createStaticTreeChildren(children, parentNode, isDOM) {
	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const childItem = children[i];
			createStaticNode(childItem, parentNode, isDOM);
		}
	} else {
		createStaticNode(children, parentNode, isDOM);
	}
}

function createStaticNode(node, parentNode, isDOM) {
	const tag = node.tag;

	if (tag) {
		const staticNode = document.createElement(tag);
		const text = node.text;

		if (text != null) {
			staticNode.textContent = text;
		} else {
			const children = node.children;
			createStaticTreeChildren(children, staticNode, isDOM);
		}
		createStaticAttributes(node, staticNode, isDOM);
		parentNode.appendChild(staticNode);
	}
}

// TODO implement when isDOM is false, for now we use only use DOM
export default function createTree(schema, isRoot, isDOM) {
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
						createStaticTreeChildren(children, templateNode, isDOM);
						if (isRoot) {
							node = createRootStaticNode(templateNode, children);
						}
					}
				} else {
					createStaticAttributes(schema, templateNode, isDOM);
					if (isRoot) {
						node = createRootStaticNode(templateNode, children);
					}
				}
			}
		}
	}
	return node;
}
