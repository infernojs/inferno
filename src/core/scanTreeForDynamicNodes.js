import { ObjectTypes } from './variables';
import isArray from '../util/isArray';

export default function scanTreeForDynamicNodes(node, nodeMap) {
	let nodeIsDynamic = false;
	let nodeHasComponents = false;

	const dynamicFlags = {
		NODE: false,
		TEXT: false,
		ATTRS: false, //attrs can also be an object
		CHILDREN: false,
		KEY: false,
		COMPONENTS: false
	};

	if (node.type === ObjectTypes.VARIABLE) {
		nodeIsDynamic = true;
		dynamicFlags.NODE = true;

	} else {
		if (node != null) {
			if (node.tag != null) {
				if (node.tag.type === ObjectTypes.VARIABLE) {
					nodeIsDynamic = true;
					nodeHasComponents = true;
					dynamicFlags.COMPONENTS = true;
				}
			}
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
							if(dynamicFlags.ATTRS === false) {
								dynamicFlags.ATTRS = {};
							}
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

							if (result.nodeIsDynamic === true) {
								nodeIsDynamic = true;
								dynamicFlags.CHILDREN = true;
								if (result.nodeHasComponents === true) {
									nodeHasComponents = true;
								}
							}
						}
					} else if (typeof node === 'object') {
						const result = scanTreeForDynamicNodes(node.children, nodeMap);

						if (result.nodeIsDynamic === true) {
							nodeIsDynamic = true;
							dynamicFlags.CHILDREN = true;
							if (result.nodeHasComponents === true) {
								nodeHasComponents = true;
							}
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
	return { nodeIsDynamic, nodeHasComponents };
}