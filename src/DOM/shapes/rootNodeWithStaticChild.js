import { recycle } from '../recycling';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners, handleHooks } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';
import addShapeAttributes from '../addShapeAttributes';

export default function createRootNodeWithStaticChild(templateNode, dynamicAttrs, recyclingEnabled) {
	const node = {
		pool: [],
		keyedPool: [],
		overrideItem: null,
		create(item, treeLifecycle) {
			let domNode;

			if (recyclingEnabled) {
				domNode = recycle(node, item);
				if (domNode) {
					return domNode;
				}
			}
			domNode = templateNode.cloneNode(true);
			if (dynamicAttrs) {
				addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle);
			}
			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle) {
			const tree = lastItem && lastItem.tree;
			const domNode = lastItem.rootNode;

			if (tree && (node !== tree.dom)) {
				recreateRootNode(domNode, lastItem, nextItem, node, treeLifecycle);
				return;
			}
			nextItem.rootNode = domNode;
			nextItem.id = lastItem.id;
			if (dynamicAttrs) {
				if (dynamicAttrs.onWillUpdate) {
					handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
				}
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
				if (dynamicAttrs.onDidUpdate) {
					handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
				}
			}
		},
		remove(item) {
			if (dynamicAttrs) {
				const domNode = item.rootNode;

				if (dynamicAttrs.onWillDetach) {
					handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
				}
				clearListeners(item, domNode, dynamicAttrs);
			}
		}
	};

	return node;
}
