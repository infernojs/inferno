import isArray from '../../util/isArray';
import { getValueWithIndex } from '../../core/variables';
import { updateKeyed } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';

export default function createNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs, domNamespace) {
	let domNode;
	const node = {
		create(item) {
			domNode = templateNode.cloneNode(false);
			const value = getValueWithIndex(item, valueIndex);

			if (value != null) {
				if (isArray(value)) {
					for (let i = 0; i < value.length; i++) {
						const childItem = value[i];
						domNode.appendChild(childItem.domTree.create(childItem));
					}
				} else if (typeof value === 'object') {
					domNode.appendChild(value.domTree.create(value));
				}
			}
			if (dynamicAttrs) {
				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
			}
			return domNode;
		},
		update(lastItem, nextItem) {
			const nextValue = getValueWithIndex(nextItem, valueIndex);
			const lastValue = getValueWithIndex(lastItem, valueIndex);

			if (nextValue !== lastValue) {
				if (typeof nextValue === 'string') {
					//debugger;
				} else if (nextValue === null) {
					// TODO
				} else if (isArray(nextValue)) {
					if (isArray(lastValue)) {
						updateKeyed(nextValue, lastValue, domNode, null);
					} else {
						//debugger;
					}
				} else {
					const tree = nextValue.domTree;

					if (tree !== null) {
						if (lastValue.domTree !== null) {
							tree.update(lastValue, nextValue);
						} else {
							// TODO implement
						}
					} else if (nextValue !== lastValue) {
						domNode.firstChild.nodeValue = nextValue;
					}
				}
			}
			if (dynamicAttrs) {
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
			}
		}
	};
	return node;
}
