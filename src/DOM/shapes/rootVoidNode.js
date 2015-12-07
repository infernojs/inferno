import isArray from '../../util/isArray';
import { isRecyclingEnabled, recycle } from '../recycling';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootVoidNode(templateNode, otherDynamicAttrs) {
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
			domNode = templateNode.cloneNode(true);
			addDOMDynamicAttributes(item, domNode, otherDynamicAttrs);

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
			updateDOMDynamicAttributes(lastItem, nextItem, domNode, otherDynamicAttrs);

			nextItem.rootNode = lastItem.rootNode;
		}
	};
	return node;
}
