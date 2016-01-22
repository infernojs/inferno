import isVoid from '../../util/isVoid';
import isVoidValue from '../../util/isVoidValue';
import { getValueWithIndex, getTypeFromValue, ValueTypes } from '../../core/variables';
import recreateNode from '../recreateNode';
import { createVirtualList, updateVirtualList } from '../domMutate';

if (process.env.NODE_ENV !== 'production') {
	const errorMsg = 'Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.';
}

export default function createDynamicNode(valueIndex) {
	const domNodeMap = {};
	let childNodeList = [];
	let keyedChildren = true;
	let nextDomNode;
	const node = {
		overrideItem: null,
		create(item, treeLifecycle, context) {
			let value = getValueWithIndex(item, valueIndex);
			let domNode;
			const type = getTypeFromValue(value);

			switch (type) {
				case ValueTypes.TEXT:
					if(isVoidValue(value)) {
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
						}
					});
					break;
				case ValueTypes.TREE:
					domNode = value.create(item, treeLifecycle, context);
					break;
				case ValueTypes.EMPTY_OBJECT:
					if (process.env.NODE_ENV !== 'production') {
						throw Error(errorMsg);
					}
					break;
				case ValueTypes.FUNCTION:
					if (process.env.NODE_ENV !== 'production') {
						throw Error(errorMsg);
					}
					break;
				case ValueTypes.FRAGMENT:
					domNode = value.tree.dom.create(value, treeLifecycle, context);
					break;
			}
			domNodeMap[item.id] = domNode;
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle, context) {

			let nextValue = getValueWithIndex(nextItem, valueIndex);
			const lastValue = getValueWithIndex(lastItem, valueIndex);

			if (nextValue !== lastValue) {

				const domNode = domNodeMap[lastItem.id];
				const nextType = getTypeFromValue(nextValue);
				const lastType = getTypeFromValue(lastValue);

				if (lastType !== nextType) {
					recreateNode(domNode, nextItem, node, treeLifecycle, context);
					return;
				}
				switch (nextType) {
					case ValueTypes.TEXT:
						if (isVoidValue(nextValue)) {
							nextValue = '';
						}
						domNode.nodeValue = nextValue;
						return;
					case ValueTypes.ARRAY:
						updateVirtualList(lastValue, nextValue, childNodeList, domNode, nextDomNode, keyedChildren, treeLifecycle, context);
						return;
					case ValueTypes.TREE:
						// TODO
						break;
					case ValueTypes.FRAGMENT:
						nextValue.tree.dom.update(lastValue, nextValue, treeLifecycle, context);
						return;
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