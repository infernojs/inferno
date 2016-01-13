import { isRecyclingEnabled, recycle } from '../recycling';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners, handleHooks } from '../addAttributes';
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
				addDOMDynamicAttributes(item, domNode, dynamicAttrs, node, 'created');
			}
			if (dynamicAttrs && dynamicAttrs.hooks) {
				treeLifecycle.addTreeSuccessListener(() => {
					handleHooks(item, dynamicAttrs, domNode, 'attached');
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
			if (dynamicAttrs && dynamicAttrs.hooks) {
				handleHooks(nextItem, dynamicAttrs, domNode, 'beforeUpdate');
			}
			if (dynamicAttrs) {
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs, null);
			}
			if (dynamicAttrs && dynamicAttrs.hooks) {
				handleHooks(nextItem, dynamicAttrs, domNode, 'afterUpdate');
			}
		},
		remove(item) {
			if (dynamicAttrs) {
				clearListeners(item, item.rootNode, dynamicAttrs);
			}
		}
	};

	return node;
}
