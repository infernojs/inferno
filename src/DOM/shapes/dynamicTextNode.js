import { getValueWithIndex } from '../../core/variables';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';

export default function createDynamicTextNode(templateNode, valueIndex) {
	var domNode;

	const node = {
		create(item) {
			domNode = templateNode.cloneNode(false);
			const value = getValueWithIndex(item, valueIndex);

			if(value != null) {
				if (typeof value !== 'string') {
					throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral as a value, this is intended for low-level optimisation purposes.');
				}
				domNode.nodeValue = value;
			}
			return domNode;
		},
		update(lastItem, nextItem) {
			const nextValue = getValueWithIndex(nextItem, valueIndex);

			if (nextValue !== getValueWithIndex(lastItem, valueIndex)) {
				if (typeof nextValue !== 'string') {
					throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral as a value, this is intended for low-level optimisation purposes.');
				}
				domNode.nodeValue = nextValue;
			}
		},
		remove(lastItem) {

		}
	};
	return node;
}
