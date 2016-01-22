import isVoid from '../../util/isVoid';
import { recycle } from '../recycling';
import { getValueWithIndex, getTypeFromValue, ValueTypes } from '../../core/variables';
import recreateRootNode from '../recreateRootNode';
import { createVirtualList, updateVirtualList } from '../domMutate';

if (process.env.NODE_ENV !== 'production') {
	const errorMsg = 'Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.';
}

export default function createRootDynamicNode(valueIndex, recyclingEnabled) {
	let nextDomNode;
	let childNodeList = [];
	let keyedChildren = true;
	const node = {
		pool: [],
		keyedPool: [],
		overrideItem: null,
		create(item, treeLifecycle, context) {
			let domNode;

			if (recyclingEnabled) {
				domNode = recycle(node, item);
				if (domNode) {
					return domNode;
				}
			}
			let value = getValueWithIndex(item, valueIndex);
			const type = getTypeFromValue(value);

			switch (type) {
				case ValueTypes.TEXT:
					// TODO check if string is empty?
					if (isVoid(value)) {
						value = '';
					}
					domNode = document.createTextNode(value);
					break;
				case ValueTypes.ARRAY:
					const virtualList = createVirtualList(value, item, childNodeList, treeLifecycle, context);

					domNode = virtualList.domNode;
					keyedChildren = virtualList.keyedChildren;
					treeLifecycle.addTreeSuccessListener(() => {
						if (childNodeList.length > 0) {
							nextDomNode = childNodeList[childNodeList.length - 1].nextSibling || null;
							domNode = childNodeList[0].parentNode;
							item.rootNode = domNode;
						}
					});
					break;
				case ValueTypes.TREE:
					domNode = value.dom.create(item, treeLifecycle, context);
					break;
				case ValueTypes.EMPTY_OBJECT:
					if (process.env.NODE_ENV !== 'production') {
						throw Error(errorMsg);
					}
					return;
				case ValueTypes.FUNCTION:
					if (process.env.NODE_ENV !== 'production') {
						throw Error(errorMsg);
					}
					return;
				case ValueTypes.FRAGMENT:
					domNode = value.tree.dom.create(value, treeLifecycle, context);
					break;
			}

			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle, context) {
			if (node !== lastItem.tree.dom) {
				recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;
			nextItem.id = lastItem.id;

			const nextValue = getValueWithIndex(nextItem, valueIndex);
			const lastValue = getValueWithIndex(lastItem, valueIndex);

			if (nextValue !== lastValue) {
				const nextType = getTypeFromValue(nextValue);
				const lastType = getTypeFromValue(lastValue);

				if (lastType !== nextType) {

					recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
					return;
				}
				switch (nextType) {
					case ValueTypes.TEXT:
						// TODO check if string is empty?
						domNode.nodeValue = nextValue;
						break;
					case ValueTypes.ARRAY:
						updateVirtualList(lastValue, nextValue, childNodeList, domNode, nextDomNode, keyedChildren, treeLifecycle, context);
						break;
					case ValueTypes.TREE:
						// TODO
						break;
					case ValueTypes.FRAGMENT:
						nextValue.tree.dom.update(lastValue, nextValue, treeLifecycle, context);
						break;
					default: break;
				}
			}
		},
		remove(item, treeLifecycle) {
			const value = getValueWithIndex(item, valueIndex);
			const type = getTypeFromValue(value);

			if (type === ValueTypes.TREE) {
				value.remove(item, treeLifecycle);
			} else if (type === ValueTypes.FRAGMENT) {
				value.tree.dom.remove(value, treeLifecycle);
			}
		}
	};

	return node;
}
