import { isRecyclingEnabled, recycle } from '../recycling';
import { getValueWithIndex } from '../../core/variables';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootDynamicNode(valueIndex, domNamespace) {
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
			const value = getValueWithIndex(item, valueIndex);
			const type = getTypeFromValue(value);

			switch (type) {
				case ValueTypes.TEXT:
					// TODO check if string is empty?
					domNode = document.createTextNode(value);
					break;
				default: break;
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
				const nextType = getTypeFromValue(nextValue);
				const lastType = getTypeFromValue(lastValue);

				if(lastType !== nextType) {
					// TODO replace node and rebuild
					return;
				}

				switch (nextType) {
					case ValueTypes.TEXT:
						// TODO check if string is empty?
						domNode.nodeValue = nextValue;
						break;
					default: break;
				}
			}
		}
	};
	return node;
}