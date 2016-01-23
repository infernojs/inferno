import { isRecyclingEnabled, recycle } from '../recycling';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners, handleHooks } from '../addAttributes';
import recreateRootNode, { recreateRootNodeFromHydration } from '../recreateRootNode';
import { validateHydrateNode } from '../hydration';
import addShapeAttributes from '../addShapeAttributes';

export default function createRootVoidNode(templateNode, dynamicAttrs, recyclingEnabled, staticNode, isSVG) {
	const dynamicAttrKeys = dynamicAttrs && Object.keys(dynamicAttrs);
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

			if (staticNode){
				return domNode;
			}

			if (dynamicAttrs) {
				addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle, isSVG);
			}
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle) {
			const domNode = lastItem.rootNode;
			const tree = lastItem && lastItem.tree;

			if (tree && (node !== tree.dom)) {
				recreateRootNode(domNode, lastItem, nextItem, node, treeLifecycle);
				return;
			}
			if (staticNode){
				nextItem.rootNode = lastItem.rootNode;
				return;
			}
			nextItem.rootNode = domNode;
			nextItem.rootNode = lastItem.rootNode;

			if (dynamicAttrs) {
				if (dynamicAttrs.onWillUpdate) {
					handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
				}
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs, dynamicAttrKeys, isSVG);
				if (dynamicAttrs.onDidUpdate) {
					handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
				}
			}
		},
		remove(item) {
			if (!staticNode){
				if (dynamicAttrs) {
					const domNode = item.rootNode;

					if (dynamicAttrs.onWillDetach) {
						handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
					}
					clearListeners(item, domNode, dynamicAttrs);
				}
			}
		},
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
