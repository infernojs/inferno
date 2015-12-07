import { ObjectTypes } from './variables';
import isArray from '../util/isArray';

export default function scanTreeForDynamicNodes(node, nodeMap) {
	let nodeIsDynamic = false;
	const dynamicFlags = {
		NODE: false,
		TEXT: false,
		ATTRS: false, //attrs can also be an object
		CHILDREN: false,
		KEY: false
	};

	if (node.type === ObjectTypes.VARIABLE) {
		nodeIsDynamic = true;
		dynamicFlags.NODE = true;

	} else {
		if (node != null) {
			if (node.text != null) {
				if (node.text.type === ObjectTypes.VARIABLE) {
					nodeIsDynamic = true;
					dynamicFlags.TEXT = true;
				}
			}
			if (node.attrs != null) {
				if (node.attrs.type === ObjectTypes.VARIABLE) {
					nodeIsDynamic = true;
					dynamicFlags.ATTRS = true;
				} else {
					for (let attr in node.attrs) {
						const attrVal = node.attrs[attr];
						if (attrVal != null && attrVal.type === ObjectTypes.VARIABLE) {
							dynamicFlags.ATTRS[attr] = attrVal.index;
							nodeIsDynamic = true;
						}
					}
				}
			}
			if (node.children != null) {
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
			if (node.key != null) {
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