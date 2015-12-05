import createRootNodeWithDynamicText from '../shapes/rootNodeWithDynamicText';
import createRootNodeWithDynamicChildren from '../shapes/rootNodeWithDynamicChildren';
import createRootNodeWithStaticText from '../shapes/rootNodeWithStaticText';
import { ObjectTypes } from './variables';

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
					if (isRoot) {
						node = createRootNodeWithStaticText(templateNode, text);
					}
				}
			} else {
				const children = schema.children;

				if (children != null) {
					if (children.type === ObjectTypes.VARIABLE) {
						if (isRoot) {
							node = createRootNodeWithDynamicChildren(templateNode, children.index);
						}
					}
				}
			}
		}
	}
	return node;
}
