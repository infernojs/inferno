import isArray from '../../util/isArray';
import isVoid from '../../util/isVoid';
import isStringOrNumber from '../../util/isStringOrNumber';
import { recycle } from '../recycling';
import { getValueWithIndex, removeValueTree } from '../../core/variables';
import { createDynamicChild, updateDynamicChild } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners, handleHooks } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';
import addShapeAttributes from '../addShapeAttributes';

export default function createRootNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs, recyclingEnabled, isSVG) {
	const dynamicAttrKeys = dynamicAttrs && Object.keys(dynamicAttrs);
	const node = {
		keyedChildren: true,
		childNodeList: [],
		pool: [],
		keyedPool: [],
		overrideItem: null,
		create(item, treeLifecycle, context) {
			let domNode;

			if (recyclingEnabled) {
				domNode = recycle(node, item, treeLifecycle, context);
				if (domNode) {
					return domNode;
				}
			}
			domNode = templateNode.cloneNode(false);
			const value = getValueWithIndex(item, valueIndex);

			if (value instanceof Promise) {
				value.then(asyncValue => {
					treeLifecycle.reset();
					createDynamicChild(asyncValue, domNode, node, treeLifecycle, context);
					treeLifecycle.trigger();
				});
			} else {
				createDynamicChild(value, domNode, node, treeLifecycle, context);
			}
			if (dynamicAttrs) {
				addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle, isSVG);
			}
			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle, context) {
			const tree = lastItem && lastItem.tree;
			const domNode = lastItem.rootNode;

			if (tree && (node !== tree.dom)) {
				node.childNodeList = [];
				recreateRootNode(domNode, lastItem, nextItem, node, treeLifecycle, context);
				return;
			}
			const nextValue = getValueWithIndex(nextItem, valueIndex);
			const lastValue = getValueWithIndex(lastItem, valueIndex);

			nextItem.rootNode = domNode;
			nextItem.id = lastItem.id;
			if (dynamicAttrs && dynamicAttrs.onWillUpdate) {
				handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
			}
			if (nextValue instanceof Promise) {
				nextValue.then(asyncValue => {
					treeLifecycle.reset();
					updateDynamicChild(lastItem, nextItem, lastValue, asyncValue, domNode, node, treeLifecycle, context, recreateRootNode);
					treeLifecycle.trigger();
				});
			} else {
				updateDynamicChild(lastItem, nextItem, lastValue, nextValue, domNode, node, treeLifecycle, context, recreateRootNode);
			}
			if (dynamicAttrs) {
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs, dynamicAttrKeys, isSVG);
				if (dynamicAttrs.onDidUpdate) {
					handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
				}
			}
		},
		remove(item, treeLifecycle) {
			removeValueTree(getValueWithIndex(item, valueIndex), treeLifecycle);
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
