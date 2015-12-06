import { ObjectTypes } from './variables';
import isArray from '../util/isArray';

export default function scanTreeForDynamicNodes(node, nodeMap) {
	let nodeIsDynamic = false;
	//const dynamicCursors = {
	//	NODE: null,
	//	TAG: null,
	//	TEXT: null,
	//	ATTRS: null,
	//	CHILDREN: null,
	//	KEY: null
	//};

	if (node.type === ObjectTypes.VARIABLE) {
		nodeIsDynamic = true;

	} else {
		if (node != null) {
			if (node.tag != null) {
				if (node.tag.type === ObjectTypes.VARIABLE) {
					nodeIsDynamic = true;
				}
			}
			if (node.text != null) {
				if (node.text.type === ObjectTypes.VARIABLE) {
					nodeIsDynamic = true;
				}
			}
			if (node.attrs != null) {
				if (node.attrs.type === ObjectTypes.VARIABLE) {
					nodeIsDynamic = true;
				} else {
					for (let attr in node.attrs) {
						const attrVal = node.attrs[attr];
						if (attrVal != null && attrVal.type === ObjectTypes.VARIABLE) {
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
								nodeIsDynamic = true
							}
						}
					} else if (typeof node === 'object') {
						const result = scanTreeForDynamicNodes(node.children, nodeMap);

						if (result === true) {
							nodeIsDynamic = true
						}
					}
				}
			}
			if (node.key != null) {
				if (node.key.type === ObjectTypes.VARIABLE) {
					nodeIsDynamic = true;
				}
			}
		}
	}
	if (nodeIsDynamic === true) {
		nodeMap.set(node, true);
	}
	return nodeIsDynamic;
}