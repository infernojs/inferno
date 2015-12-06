import isArray from '../../util/isArray';
import { isRecyclingEnabled, recycle } from '../recycling';
import { getValueWithIndex } from '../../core/variables';
import { updateKeyed } from '../domMutate';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootNodeWithDynamicChild(templateNode, valueIndex, domNamespace) {
	const node = {
		pool: [],
		keyedPool: [],
		create(item) {
			let domNode;
			if (recyclingEnabled) {
				domNode = recycle(node, item);
				if (domNode) {
					return domNode;
				}
			}
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
			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem) {
			let domNode;

			if (node !== lastItem.domTree) {
				const lastDomNode = lastItem.rootNode;
				domNode = this.create(nextItem);
				lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
				// TODO recycle old node
				return;
			}

			domNode = lastItem.rootNode;
			nextItem.rootNode = domNode;
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
		}
	};
	return node;
}
