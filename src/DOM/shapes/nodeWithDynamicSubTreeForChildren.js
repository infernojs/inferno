import isArray from '../../util/isArray';
import isVoid from '../../util/isVoid';
import addShapeChildren from '../../shared/addShapeChildren';
import replaceChild from '../../core/replaceChild';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners, handleHooks } from '../addAttributes';

export default function createNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs, isSVG) {
	const dynamicAttrKeys = dynamicAttrs && Object.keys(dynamicAttrs);
	const domNodeMap = {};
	const node = {
		overrideItem: null,
		create(item, treeLifecycle, context) {
			const domNode = templateNode.cloneNode(false);

			addShapeChildren(domNode, subTreeForChildren, item, treeLifecycle, context);

			if (dynamicAttrs) {
				addDOMDynamicAttributes(item, domNode, dynamicAttrs, node, 'onCreated', isSVG);
				if (dynamicAttrs.onAttached) {
					treeLifecycle.addTreeSuccessListener(() => {
						handleHooks(item, dynamicAttrs, domNode, 'onAttached');
					});
				}
			}
			domNodeMap[item.id] = domNode;
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle, context) {
			const domNode = domNodeMap[lastItem.id];

			if (dynamicAttrs && (dynamicAttrs.onWillUpdate)) {
				handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
			}
			if (!isVoid(subTreeForChildren)) {
				if (isArray(subTreeForChildren)) {
					for (let i = 0; i < subTreeForChildren.length; i++) {
						const subTree = subTreeForChildren[i];

						subTree.update(lastItem, nextItem, treeLifecycle, context);
					}
				} else if (typeof subTreeForChildren === 'object') {
					const newDomNode = subTreeForChildren.update(lastItem, nextItem, treeLifecycle, context);

					if (newDomNode) {
						replaceChild(domNode, newDomNode);
					}
				}
			}
			if (dynamicAttrs) {
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs, dynamicAttrKeys, isSVG);
				if (dynamicAttrs.onDidUpdate) {
					handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
				}
			}
		},
		remove(item, treeLifecycle) {
			const domNode = domNodeMap[item.id];

			if (!isVoid(subTreeForChildren)) {
				if (isArray(subTreeForChildren)) {
					for (let i = 0; i < subTreeForChildren.length; i++) {
						const subTree = subTreeForChildren[i];

						subTree.remove(item, treeLifecycle);
					}
				} else if (typeof subTreeForChildren === 'object') {
					subTreeForChildren.remove(item, treeLifecycle);
				}
			}
			if (dynamicAttrs) {
				clearListeners(item, domNode, dynamicAttrs);
				if (dynamicAttrs.onWillDetach) {
					handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
				}
			}
		}
	};
	return node;
}
