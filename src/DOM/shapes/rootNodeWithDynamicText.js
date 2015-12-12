import { isRecyclingEnabled, recycle } from '../recycling';
import { getValueWithIndex } from '../../core/variables';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootNodeWithDynamicText(templateNode, valueIndex, dynamicAttrs) {
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

			if(value != null) {
				domNode.textContent = value;
			}
			if (dynamicAttrs) {
				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
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

			if (nextValue !== getValueWithIndex(lastItem, valueIndex)) {
				domNode.firstChild.nodeValue = nextValue;
			}
			if (dynamicAttrs) {
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
			}
		}
	};
	return node;
}