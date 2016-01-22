import isVoid from '../../util/isVoid';
import isStringOrNumber from '../../util/isStringOrNumber';
import { getValueWithIndex } from '../../core/variables';

export default function createDynamicTextNode(templateNode, valueIndex) {
	const domNodeMap = {};
	return {
		overrideItem: null,
		create(item) {
			const domNode = templateNode.cloneNode(false);
			const value = getValueWithIndex(item, valueIndex);

			if (!isVoid(value) && isStringOrNumber(value)) {
				domNode.nodeValue = value;
			}
			domNodeMap[item.id] = domNode;
			return domNode;
		},
		update(lastItem, nextItem) {
			let domNode = domNodeMap[lastItem.id];
			const nextValue = getValueWithIndex(nextItem, valueIndex);
			const lastValue = getValueWithIndex(lastItem, valueIndex);

			if (nextValue !== lastValue && (isStringOrNumber(nextValue))) {
				domNode.nodeValue = nextValue;
			}
		},
		remove() {}
	};
}
