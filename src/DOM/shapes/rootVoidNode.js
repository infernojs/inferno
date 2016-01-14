import { isRecyclingEnabled, recycle } from '../recycling';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners, handleHooks, hookTypes } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';

export default function createRootVoidNode(templateNode, dynamicAttrs, recyclingEnabled) {
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
			item.rootNode = domNode;
			if (dynamicAttrs) {
				addDOMDynamicAttributes(item, domNode, dynamicAttrs, node, 'onCreated');
			}
			if (dynamicAttrs) {
				treeLifecycle.addTreeSuccessListener(() => {
					handleHooks(item, dynamicAttrs, domNode, 'onAttached');
				});
			}
			return domNode;
		},
		update(lastItem, nextItem) {
			if (node !== lastItem.tree.dom) {
				recreateRootNode(lastItem, nextItem, node);
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;
			nextItem.rootNode = lastItem.rootNode;
			if (dynamicAttrs) {
				handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
			}
			if (dynamicAttrs) {
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs, null);
			}
			if (dynamicAttrs) {
				handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
			}
		},
		remove(item) {
			if (dynamicAttrs) {
				const domNode = item.rootNode;

				clearListeners(item, item.rootNode, dynamicAttrs);
				if (dynamicAttrs) {
					handleHooks(item, dynamicAttrs, domNode, 'onDetached');
				}
			}
		}
	};

	return node;
}
