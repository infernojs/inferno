import { recycle } from '../recycling';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners, handleHooks } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';

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
				addDOMDynamicAttributes(item, domNode, dynamicAttrs, node, 'onCreated');
				if (dynamicAttrs.onAttached) {
					treeLifecycle.addTreeSuccessListener(() => {
						handleHooks(item, dynamicAttrs, domNode, 'onAttached');
					});
				}
			}
			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle) {
			if (node !== lastItem.tree.dom) {
				recreateRootNode(lastItem, nextItem, node, treeLifecycle);
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;
			nextItem.id = lastItem.id;
			if (dynamicAttrs) {
				if(dynamicAttrs.onWillUpdate) {
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

				if (dynamicAttrs.onDetached) {
					handleHooks(item, dynamicAttrs, domNode, 'onDetached');
				}
				clearListeners(item, domNode, dynamicAttrs);
			}
		}
	};

	return node;
}
