import { getValueWithIndex } from '../../core/variables';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';

export default function createNodeWithStaticChild(templateNode, dynamicAttrs) {
	let domNode;
	const node = {
		create(item) {
			domNode = templateNode.cloneNode(true);
			if (dynamicAttrs) {
				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
			}
			return domNode;
		},
		update(lastItem, nextItem) {
			if (dynamicAttrs) {
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
			}
		}
	};
	return node;
}