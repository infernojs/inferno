import isArray from '../../util/isArray';
import { getValueWithIndex } from '../../core/variables';
import { updateKeyed } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';

export default function createNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs, domNamespace) {
	let domNode;
	const node = {
		create(item, treeLifecycle) {
			domNode = templateNode.cloneNode(false);
			const value = getValueWithIndex(item, valueIndex);

			if (value != null) {
				if (isArray(value)) {
					for (let i = 0; i < value.length; i++) {
						const childItem = value[i];

						if (typeof childItem === 'object') {
							domNode.appendChild(childItem.domTree.create(childItem));
						} else if (typeof childItem === 'string' || typeof childItem === 'number') {
							const textNode = document.createTextNode(childItem);
							domNode.appendChild(textNode);
						}
					}
				} else if (typeof value === 'object') {
					domNode.appendChild(value.domTree.create(value));
				} else if (typeof value === 'string' || typeof value === 'number') {
					domNode.textContent = value;
				}
			}
			if (dynamicAttrs) {
				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
			}
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle) {
			const nextValue = getValueWithIndex(nextItem, valueIndex);
			const lastValue = getValueWithIndex(lastItem, valueIndex);

			if (nextValue !== lastValue) {
				if (typeof nextValue === 'string') {
					domNode.firstChild.nodeValue = nextValue;
				} else if (nextValue === null) {
					// TODO
				} else if (isArray(nextValue)) {
					if (isArray(lastValue)) {
						updateKeyed(nextValue, lastValue, domNode, null);
					} else {
						//debugger;
					}
				} else if (typeof nextValue === 'object') {
					const tree = nextValue.domTree;

					if (tree !== null) {
						if (lastValue.domTree !== null) {
							tree.update(lastValue, nextValue);
						} else {
							// TODO implement
						}
					}
				} else if (typeof nextValue === 'string' || typeof nextValue === 'number') {
					domNode.firstChild.nodeValue = nextValue;
				}
			}
			if (dynamicAttrs) {
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
			}
		}
	};
	return node;
}
