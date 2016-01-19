import { isRecyclingEnabled, recycle } from '../recycling';
import recreateRootNode, { recreateRootNodeFromHydration } from '../recreateRootNode';
import { validateHydrateNode } from '../hydration';

export default function createRootStaticNode(templateNode, recyclingEnabled) {
	const node = {
		html: templateNode.innerHTML,
		pool: [],
		keyedPool: [],
		overrideItem: null,
		create(item) {
			let domNode;

			if (recyclingEnabled) {
				domNode = recycle(node, item);
				if (domNode) {
					return domNode;
				}
			}
			domNode = templateNode.cloneNode(true);
			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem) {
			if (node !== lastItem.tree.dom) {
				recreateRootNode(lastItem, nextItem, node);
				return;
			}
			if (nextItem.tree.dom !== lastItem.tree.dom) {
				recreateRootNode(lastItem, nextItem, nextItem.tree.dom);
				return;
			}
			nextItem.rootNode = lastItem.rootNode;
		},
		remove() {},
		hydrate(hydrateNode, item) {
			if (!validateHydrateNode(hydrateNode, templateNode, item)) {
				recreateRootNodeFromHydration(hydrateNode, item, node);
				return;
			}
			item.rootNode = hydrateNode;
		}
	};

	return node;
}
