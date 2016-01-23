import isArray from '../../util/isArray';
import isVoid from '../../util/isVoid';
import recreateNode from '../recreateNode';
import isStringOrNumber from '../../util/isStringOrNumber';
import { getValueWithIndex, removeValueTree } from '../../core/variables';
import { updateKeyed, updateNonKeyed, createDynamicChild, updateDynamicChild } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners, handleHooks } from '../addAttributes';
import addShapeAttributes from '../addShapeAttributes';

export default function createNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs) {
	const node = {
		keyedChildren: true,
		domNodeMap: {},
		childNodeList: [],
		overrideItem: null,
		create(item, treeLifecycle, context) {
			const domNode = templateNode.cloneNode(false);
			const value = getValueWithIndex(item, valueIndex);

			if (value instanceof Promise) {
				value.then(asyncValue => {
					createDynamicChild(asyncValue, domNode, node, treeLifecycle, context);
				});
			} else {
				createDynamicChild(value, domNode, node, treeLifecycle, context);
			}
			if (dynamicAttrs) {
				addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle);
			}
			node.domNodeMap[item.id] = domNode;
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle, context) {
			const domNode = node.domNodeMap[lastItem.id];
			const nextValue = getValueWithIndex(nextItem, valueIndex);
			const lastValue = getValueWithIndex(lastItem, valueIndex);

			if (dynamicAttrs && dynamicAttrs.onWillUpdate) {
				handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
			}
			if (nextValue instanceof Promise) {
				nextValue.then(asyncValue => {
					treeLifecycle.reset();
					updateDynamicChild(lastItem, nextItem, lastValue, asyncValue, domNode, node, treeLifecycle, context, recreateNode);
					treeLifecycle.trigger();
				});
			} else {
				updateDynamicChild(lastItem, nextItem, lastValue, nextValue, domNode, node, treeLifecycle, context, recreateNode);
			}
			if (dynamicAttrs) {
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
				if (dynamicAttrs.onDidUpdate) {
					handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
				}
			}
		},
		remove(item, treeLifecycle) {
			removeValueTree(getValueWithIndex(item, valueIndex), treeLifecycle);
			if (dynamicAttrs) {
				const domNode = node.domNodeMap[item.id];

				if (dynamicAttrs.onWillDetach) {
					handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
				}
				clearListeners(item, domNode, dynamicAttrs);
			}
		}
	};

	return node;
}
