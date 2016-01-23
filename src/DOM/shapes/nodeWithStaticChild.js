import { updateDOMDynamicAttributes, clearListeners, handleHooks } from '../addAttributes';
import addShapeAttributes from '../addShapeAttributes';

export default function createNodeWithStaticChild(templateNode, dynamicAttrs, isSVG) {
	const dynamicAttrKeys = dynamicAttrs && Object.keys(dynamicAttrs);
	const domNodeMap = {};
	const node = {
		overrideItem: null,
		create(item, treeLifecycle) {
			const domNode = templateNode.cloneNode(true);

			if (dynamicAttrs) {
				addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle, isSVG);
			}
			domNodeMap[item.id] = domNode;
			return domNode;
		},
		update(lastItem, nextItem) {
			const domNode = domNodeMap[lastItem.id];

			if (dynamicAttrs) {
				if (dynamicAttrs.onWillUpdate) {
					handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
				}
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs, dynamicAttrKeys);
				if (dynamicAttrs.onDidUpdate) {
					handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
				}
			}
		},
		remove(item) {
			if (dynamicAttrs) {
				const domNode = domNodeMap[item.id];

				if (dynamicAttrs.onWillDetach) {
					handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
				}
				clearListeners(item, domNode, dynamicAttrs);
			}
		}
	};

	return node;
}
