import { getValueWithIndex } from '../../core/variables';

export default function createNodeWithDynamicText(templateNode, valueIndex, otherDynamicAttrs) {
	var domNode;

	const node = {
		create(item) {
			domNode = templateNode.cloneNode(false);
			const value = getValueWithIndex(item, valueIndex);

			if(value != null) {
				domNode.textContent = value;
			}
			return domNode;
		},
		update(lastItem, nextItem) {
			const nextValue = getValueWithIndex(nextItem, valueIndex);

			if (nextValue !== getValueWithIndex(lastItem, valueIndex)) {
				domNode.firstChild.nodeValue = nextValue;
			}
		}
	};
	return node;
}