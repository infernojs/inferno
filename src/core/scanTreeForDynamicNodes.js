import { ObjectTypes } from './variables';
import isArray from '../util/isArray';
import isVoid from '../util/isVoid';

export default function scanTreeForDynamicNodes(node, nodes) {
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
	if (node.index !== undefined) {
		nodeIsDynamic = true;
		dynamicFlags.NODE = true;
	} else {
		if (!isVoid(node)) {
			if (!isVoid(node.tag)) {
				if (typeof node.tag === 'object') {
					if (node.tag.index !== undefined) {
						nodeIsDynamic = true;
						dynamicFlags.COMPONENTS = true;
					} else {
						throw Error(`Inferno Error: Incorrect tag name passed. Tag name must be a reference to a component, function or string.`);
					}
				}
			}
			if (!isVoid(node.text)) {
				if (node.text.index !== undefined) {
					nodeIsDynamic = true;
					dynamicFlags.TEXT = true;
				}
			}
			if (!isVoid(node.attrs)) {
				if (node.attrs.index !== undefined) {
					nodeIsDynamic = true;
					dynamicFlags.ATTRS = true;
				} else {
					for (let attr in node.attrs) {
						const attrVal = node.attrs[attr];

						if (!isVoid(attrVal) && attrVal.index !== undefined) {
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
				if (node.children.index !== undefined) {
					nodeIsDynamic = true;
				} else {
					if (isArray(node.children)) {
						for (let i = 0; i < node.children.length; i++) {
							const childItem = node.children[i];
							const result = scanTreeForDynamicNodes(childItem, nodes);

							if (result === true) {
								nodeIsDynamic = true;
								dynamicFlags.CHILDREN = true;
							}
						}
					} else if (typeof node === 'object') {
						const result = scanTreeForDynamicNodes(node.children, nodes);

						if (result === true) {
							nodeIsDynamic = true;
							dynamicFlags.CHILDREN = true;
						}
					}
				}
			}
			if (!isVoid(node.key)) {
				if (node.key.index !== undefined) {
					nodeIsDynamic = true;
					dynamicFlags.KEY = true;
				}
			}
		}
	}
	if (nodeIsDynamic === true) {
		nodes.push({ node, dynamicFlags });
	}
	return nodeIsDynamic;
}
