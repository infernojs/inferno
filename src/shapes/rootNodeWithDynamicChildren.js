import isArray from '../util/isArray';
import { isRecyclingEnabled, recycle } from '../core/recycling';
import { getValueWithIndex } from '../core/variables';
import { updateKeyed } from '../core/domController';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootNodeWithDynamicChildren(templateNode, valueIndex) {
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
						domNode.appendChild(childItem.tree.create(childItem));
					}
				} else {
					//debugger;
				}
			}
			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem) {
			let domNode;

			if (node !== lastItem.tree) {
				var lastDomNode = lastItem.rootNode;
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
						// TODO
					}
				} else {
					//debugger;
					// TODO
				}
			}
		}
	};
	return node;
}
