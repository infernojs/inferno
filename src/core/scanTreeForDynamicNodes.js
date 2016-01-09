import { ObjectTypes } from './variables';
import isArray from '../util/isArray';
import isVoid from '../util/isVoid';

export default function scanTreeForDynamicNodes(node, nodeMap) {
	let nodeIsDynamic = false;
	const dynamicFlags = {
		NODE: false,
		TEXT: false,
		ATTRS: false, // attrs can also be an object
		CHILDREN: false,
		KEY: false,
		COMPONENTS: false
	};

	if (isVoid(node)) {
		return false;
	}

	if (node.type === ObjectTypes.VARIABLE) {
		nodeIsDynamic = true;
		dynamicFlags.NODE = true;

	} else {
		if (!isVoid(node)) {
			if (!isVoid(node.tag)) {
				if (node.tag.type === ObjectTypes.VARIABLE) {
					nodeIsDynamic = true;
					dynamicFlags.COMPONENTS = true;
				}
			}
			if (!isVoid(node.text)) {
				if (node.text.type === ObjectTypes.VARIABLE) {
					nodeIsDynamic = true;
					dynamicFlags.TEXT = true;
				}
			}
			if (!isVoid(node.attrs)) {
				if (node.attrs.type === ObjectTypes.VARIABLE) {
					nodeIsDynamic = true;
					dynamicFlags.ATTRS = true;
				} else {
					for (let attr in node.attrs) {
						const attrVal = node.attrs[attr];

						if (!isVoid(attrVal) && attrVal.type === ObjectTypes.VARIABLE) {
							if (attr === 'xmlns') {
								throw Error(`Inferno Error: The 'xmlns' attribute cannot be dynamic. Please use static value for 'xmlns' attribute instead.`);
							}
							if (dynamicFlags.ATTRS === false) {
								dynamicFlags.ATTRS = {};
							}
							dynamicFlags.ATTRS[attr] = attrVal.index;
							nodeIsDynamic = true;
						}
					}
				}
			}
			if (!isVoid(node.children)) {
				if (node.children.type === ObjectTypes.VARIABLE) {
					nodeIsDynamic = true;
				} else {
					if (isArray(node.children)) {
						for (let i = 0; i < node.children.length; i++) {
							const childItem = node.children[i];
							const result = scanTreeForDynamicNodes(childItem, nodeMap);

							if (result === true) {
								nodeIsDynamic = true;
								dynamicFlags.CHILDREN = true;
							}
						}
					} else if (typeof node === 'object') {
						const result = scanTreeForDynamicNodes(node.children, nodeMap);

						if (result === true) {
							nodeIsDynamic = true;
							dynamicFlags.CHILDREN = true;
						}
					}
				}
			}
			if (!isVoid( node.key)) {
				if (node.key.type === ObjectTypes.VARIABLE) {
					nodeIsDynamic = true;
					dynamicFlags.KEY = true;
				}
			}
		}
	}
	if (nodeIsDynamic === true) {
		nodeMap.set(node, dynamicFlags);
	}
	return nodeIsDynamic;
}
