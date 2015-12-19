import { getValueWithIndex } from '../../core/variables';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';

export default function createDynamicTextNode(templateNode, valueIndex) {
	var domNode;

	const node = {
		create(item) {
			domNode = templateNode.cloneNode(false);
			const value = getValueWithIndex(item, valueIndex);

			if(value != null) {
				domNode.nodeValue = value;
			}
			return domNode;
		},
		update(lastItem, nextItem) {
			const nextValue = getValueWithIndex(nextItem, valueIndex);

			if (nextValue !== getValueWithIndex(lastItem, valueIndex)) {
				domNode.nodeValue = nextValue;
			}
		},
		remove(lastItem) {

		}
	};
	return node;
}
