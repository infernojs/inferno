import { isRecyclingEnabled, recycle } from '../core/recycling';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootNodeWithStaticText(templateNode, text) {
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

			if(text != null) {
				domNode.textContent = text;
			}
			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem) {
			nextItem.rootNode = lastItem.rootNode;
		}
	};
	return node;
}