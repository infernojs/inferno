import createRootNodeWithDynamicText from './shapes/rootNodeWithDynamicText';
import createNodeWithDynamicText from './shapes/nodeWithDynamicText';
import createRootNodeWithDynamicChild from './shapes/rootNodeWithDynamicChild';
import createRootNodeWithDynamicSubTreeForChildren from './shapes/rootNodeWithDynamicSubTreeForChildren';
import createRootStaticNode from './shapes/rootStaticNode';
import createStaticNode from './shapes/staticNode';

import { ObjectTypes } from '../core/variables';
import isArray from '../util/isArray';
import addDOMAttributes from './addAttributes';

const tagError = `Inferno Error: Tag names cannot be dynamic, they must always be static. Try using an alternative template to achieve the same results.`;

function createStaticAttributes(node, domNode) {
	if (node.attrs != null) {
		addDOMAttributes(node, domNode, node.attrs);
	}
}

function createStaticTreeChildren(children, parentNode, domNamespace) {
	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const childItem = children[i];
			if (typeof childItem === 'string' || typeof childItem === 'number') {
				const textNode = document.createTextNode(childItem);
				parentNode.appendChild(textNode);
			} else {
				createStaticTreeNode(childItem, parentNode, domNamespace);
			}
		}
	} else {
		if (typeof children === 'string' || typeof children === 'number') {
			parentNode.textContent = children;
		} else {
			createStaticTreeNode(children, parentNode, domNamespace);
		}
	}
}

function createStaticTreeNode(node, parentNode, domNamespace) {
	let staticNode;

	if (typeof node === 'string' || typeof node === 'number') {
		staticNode = document.createTextNode(node);
	} else {
		const tag = node.tag;

		if (tag) {
			if (tag.type === ObjectTypes.VARIABLE) {
				throw Error(tagError);
			}
			// TODO handle SVG namespaces with IS
			switch (tag) {
				case 'svg': domNamespace = 'http://www.w3.org/2000/svg'; break;
				case 'math': domNamespace = 'http://www.w3.org/1998/Math/MathML'; break;
				default: break;
			}
			if (domNamespace) {
				staticNode = document.createElementNS(domNamespace, tag);
			} else {
				staticNode = document.createElement(tag);
			}
			const text = node.text;

			if (text != null) {
				staticNode.textContent = text;
			} else {
				const children = node.children;
				if (children != null) {
					createStaticTreeChildren(children, staticNode, domNamespace);
				}
			}
			createStaticAttributes(node, staticNode);
		} else if (node.text) {
			staticNode = document.createTextNode(node.text);
		}
	}
	if (parentNode === null) {
		return staticNode;
	} else {
		parentNode.appendChild(staticNode);
	}
}

export default function createDOMTree(schema, isRoot, dynamicNodeMap, domNamespace) {
	const dynamicFlags = dynamicNodeMap.get(schema);
	let node;
	let templateNode;

	if (!dynamicFlags) {
		templateNode = createStaticTreeNode(schema, null, domNamespace);

		if (isRoot) {
			node = createRootStaticNode(templateNode);
		} else {
			node = createStaticNode(templateNode);
		}
	} else {
		if (schema.type === ObjectTypes.VARIABLE) {
			// TODO
		} else {
			const tag = schema.tag;

			if(tag) {
				if (tag.type === ObjectTypes.VARIABLE) {
					throw Error(tagError);
				}
				switch (tag) {
					case 'svg': domNamespace = 'http://www.w3.org/2000/svg'; break;
					case 'math': domNamespace = 'http://www.w3.org/1998/Math/MathML'; break;
					default: break;
				}
				// TODO handle SVG namespaces with IS
				if (domNamespace) {
					templateNode = document.createElementNS(domNamespace, tag);
				} else {
					templateNode = document.createElement(tag);
				}
				const attrs = schema.attrs;

				if (attrs != null) {
					if (dynamicFlags.ATTRS === true) {
						//debugger;
					} else if (dynamicFlags.ATTRS !== false) {
						//debugger;
					} else {
						createStaticAttributes(schema, templateNode);
					}
				}
				const text = schema.text;

				if (text != null) {
					if (dynamicFlags.TEXT === true) {
						if (isRoot) {
							node = createRootNodeWithDynamicText(templateNode, text.index);
						} else {
							node = createNodeWithDynamicText(templateNode, text.index);
						}
					} else {
						templateNode.textContent = text;
					}
				} else {
					const children = schema.children;

					if (children != null) {
						if (children.type === ObjectTypes.VARIABLE) {
							if (isRoot) {
								node = createRootNodeWithDynamicChild(templateNode, children.index, domNamespace);
							}
						} else if (dynamicFlags.CHILDREN === true) {
							let subTreeForChildren = [];
							if(isArray(children)) {
								for (let i = 0; i < children.length; i++) {
									const childItem = children[i];
									subTreeForChildren.push(createDOMTree(childItem, false, dynamicNodeMap, domNamespace));
								}
							} else if (typeof children === 'object') {
								subTreeForChildren = createDOMTree(children, false, dynamicNodeMap, domNamespace);
							}
							if (isRoot) {
								node = createRootNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, domNamespace);
							}
						} else {
							// TODO static children on a dynamic node
						}
					}
				}
			}
		}
	}
	return node;
}