import isVoid from '../util/isVoid';
import { getValueWithIndex, getTypeFromValue, ValueTypes } from '../core/variables';
import isArray from '../util/isArray';
import isStringOrNumber from '../util/isStringOrNumber';
import { isRecyclingEnabled, pool } from './recycling';
import replaceChild from '../core/replaceChild';
import appendText from '../util/appendText';
import removeChild from '../core/removeChild';
import updateAndAppendDynamicChildren from '../shared/updateAndAppendDynamicChildren';

const recyclingEnabled = isRecyclingEnabled();

export function updateKeyed(items, oldItems, parentNode, parentNextNode, treeLifecycle, context) {
	let stop = false;
	let startIndex = 0;
	let oldStartIndex = 0;
	const itemsLength = items.length;
	const oldItemsLength = oldItems.length;
	let startItem = itemsLength > 0 && items[startIndex];

	// Edge case! In cases where someone try to update from [null] to [null], 'startitem' will be null.
	// Also in cases where someone try to update from [{}] to [{}] (empty object to empty object)
	// We solve that with avoiding going into the iteration loop.
	if (isVoid(startItem) && (isVoid(startItem.tree))) {
		return;
	}
	if (isVoid(items) || itemsLength === 0 && oldItemsLength >= 5) {
		if (recyclingEnabled) {
			for (let i = 0; i < oldItemsLength; i++) {
				pool(oldItems[i]);
			}
		}
		parentNode.textContent = '';
		return;
	}
	let endIndex = itemsLength - 1;
	let oldEndIndex = oldItemsLength - 1;
	let oldStartItem = oldItemsLength > 0 && oldItems[oldStartIndex];
	let endItem;
	let oldEndItem;
	let nextNode;
	let oldItem;
	let item;

	outer: while (!stop && startIndex <= endIndex && oldStartIndex <= oldEndIndex) {
		stop = true;
		while (startItem.key === oldStartItem.key) {
			startItem.tree.dom.update(oldStartItem, startItem, treeLifecycle, context);
			startIndex++;
			oldStartIndex++;
			if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
				break outer;
			} else {
				startItem = items[startIndex];
				oldStartItem = oldItems[oldStartIndex];
				stop = false;
			}
		}
		endItem = items[endIndex];
		oldEndItem = oldItems[oldEndIndex];

		while (endItem.key === oldEndItem.key) {
			endItem.tree.dom.update(oldEndItem, endItem, treeLifecycle, context);
			endIndex--;
			oldEndIndex--;
			if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
				break outer;
			} else {
				endItem = items[endIndex];
				oldEndItem = oldItems[oldEndIndex];
				stop = false;
			}
		}
		while (endItem.key === oldStartItem.key) {
			nextNode = (endIndex + 1 < itemsLength) ? items[endIndex + 1].rootNode : parentNextNode;
			endItem.tree.dom.update(oldStartItem, endItem, treeLifecycle, context);
			insertOrAppend(parentNode, endItem.rootNode, nextNode);
			endIndex--;
			oldStartIndex++;
			if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
				break outer;
			} else {
				endItem = items[endIndex];
				oldStartItem = oldItems[oldStartIndex];
				stop = false;
			}
		}
		while (startItem.key === oldEndItem.key) {
			nextNode = oldItems[oldStartIndex].rootNode;
			startItem.tree.dom.update(oldEndItem, startItem, treeLifecycle, context);
			insertOrAppend(parentNode, startItem.rootNode, nextNode);
			startIndex++;
			oldEndIndex--;
			if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
				break outer;
			} else {
				startItem = items[startIndex];
				oldEndItem = oldItems[oldEndIndex];
				stop = false;
			}
		}
	}

	if (oldStartIndex > oldEndIndex) {
		if (startIndex <= endIndex) {
			nextNode = (endIndex + 1 < itemsLength) ? items[endIndex + 1].rootNode : parentNextNode;
			for (; startIndex <= endIndex; startIndex++) {
				item = items[startIndex];
				insertOrAppend(parentNode, item.tree.dom.create(item, treeLifecycle, context), nextNode);
			}
		}
	} else if (startIndex > endIndex) {
		for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
			oldItem = oldItems[oldStartIndex];
			remove(oldItem, parentNode);
		}
	} else {
		const oldItemsMap = {};
		let oldNextItem = (oldEndIndex + 1 < oldItemsLength) ? oldItems[oldEndIndex + 1] : null;

		for (let i = oldEndIndex; i >= oldStartIndex; i--) {
			oldItem = oldItems[i];
			oldItem.nextItem = oldNextItem;
			oldItemsMap[oldItem.key] = oldItem;
			oldNextItem = oldItem;
		}
		let nextItem = (endIndex + 1 < itemsLength) ? items[endIndex + 1] : null;

		for (let i = endIndex; i >= startIndex; i--) {
			item = items[i];
			const key = item.key;

			oldItem = oldItemsMap[key];
			if (oldItem) {
				oldItemsMap[key] = null;
				oldNextItem = oldItem.nextItem;
				item.tree.dom.update(oldItem, item, treeLifecycle, context);
				if (item.rootNode.nextSibling !== (nextItem && nextItem.rootNode)) {
					nextNode = (nextItem && nextItem.rootNode) || parentNextNode;
					insertOrAppend(parentNode, item.rootNode, nextNode);
				}
			} else {
				nextNode = (nextItem && nextItem.rootNode) || parentNextNode;
				insertOrAppend(parentNode, item.tree.dom.create(item, treeLifecycle, context), nextNode);
			}
			nextItem = item;
		}
		for (let i = oldStartIndex; i <= oldEndIndex; i++) {
			oldItem = oldItems[i];
			if (oldItemsMap[oldItem.key] !== null) {
				item = oldItems[oldStartIndex];
				remove(oldItem, parentNode);
			}
		}
	}
}

export function updateNonKeyed(items, oldItems, domNodeList, parentNode, parentNextNode, treeLifecycle, context) {
	let itemsLength;
	let offset = 0;

	if (items) {
		if (!isVoid(oldItems)) {
			itemsLength = Math.max(items.length, oldItems.length);
			for (let i = 0; i < itemsLength; i++) {
				const item = items[i];
				const oldItem = oldItems[i];

				if (!isVoid(item)) {
					if (!isVoid(oldItem)) {
						if (isStringOrNumber(item)) {
							let domNode = domNodeList[i];

							if (domNode) {
								domNode.nodeValue = item;
							}
						} else if (typeof item === 'object') {
							item.tree.dom.update(oldItem, item, treeLifecycle, context);
						}
					} else {
						if (isStringOrNumber(item)) {
							const childNode = document.createTextNode(item);
							domNodeList[i] = childNode;
							insertOrAppend(parentNode, childNode, parentNextNode);
						} else if (typeof item === 'object') {
							const childNode = item.tree.dom.create(item, treeLifecycle, context);
							domNodeList[i] = childNode;
							insertOrAppend(parentNode, childNode, parentNextNode);
						}
					}
				} else {
					if (domNodeList[i + offset]) {
						parentNode.removeChild(domNodeList[i + offset]);
						domNodeList.splice(i + offset, 1);
						offset--;
					}
				}
			}
		}
	}
}

export function insertOrAppend(parentNode, newNode, nextNode) {
	if (nextNode) {
		parentNode.insertBefore(newNode, nextNode);
	} else {
		parentNode.appendChild(newNode);
	}
}

export function remove(item, parentNode) {
	const rootNode = item.rootNode;

	if (isVoid(rootNode) || !(rootNode.nodeType)) {
		return null;
	}
	if (rootNode === parentNode) {
		parentNode.innerHTML = '';
	} else {
		parentNode.removeChild(item.rootNode);
		if (recyclingEnabled) {
			pool(item);
		}
	}
}

export function createVirtualList(value, item, childNodeList, treeLifecycle, context) {
	if (isVoid(value)) {
		return null;
	}
	const domNode = document.createDocumentFragment();
	let keyedChildren = true;

	for (let i = 0; i < value.length; i++) {
		const childNode = value[i];
		const childType = getTypeFromValue(childNode);
		let childDomNode;

		if (process.env.NODE_ENV !== 'production') {
			if (childType === ValueTypes.EMPTY_OBJECT ||
				childType === ValueTypes.FUNCTION ||
				childType === ValueTypes.ARRAY) {
				throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
			}
		}
		switch (childType) {
			case ValueTypes.TEXT:
				childDomNode = document.createTextNode(childNode);
				childNodeList.push(childDomNode);
				domNode.appendChild(childDomNode);
				keyedChildren = false;
				break;
			case ValueTypes.TREE:
				keyedChildren = false;
				childDomNode = childNode.create(item, treeLifecycle, context);
				childNodeList.push(childDomNode);

				if (process.env.NODE_ENV !== 'production') {
					if (childDomNode === undefined) {
						throw Error('Inferno Error: Children must be provided as templates.');
					}
				}
				domNode.appendChild(childDomNode);
				break;
			case ValueTypes.FRAGMENT:
				if (childNode.key === undefined) {
					keyedChildren = false;
				}
				childDomNode = childNode.tree.dom.create(childNode, treeLifecycle, context);
				childNodeList.push(childDomNode);
				domNode.appendChild(childDomNode);
				break;
		}
	}
	return { domNode, keyedChildren };
}

export function updateVirtualList(lastValue, nextValue, childNodeList, domNode, nextDomNode, keyedChildren, treeLifecycle, context) {
	if (isVoid(lastValue)) {
		return null;
	}
	// NOTE: if someone switches from keyed to non-keyed, the node order won't be right...
	if (isArray(lastValue)) {
		if (keyedChildren) {
			updateKeyed(nextValue, lastValue, domNode, nextDomNode, treeLifecycle, context);
		} else if (nextValue !== lastValue) {
			updateNonKeyed(nextValue, lastValue, childNodeList, domNode, nextDomNode, treeLifecycle, context);
		}
	} else {
		// TODO
	}
}

export function createDynamicChild(value, domNode, node, treeLifecycle, context) {
	if (!isVoid(value)) {
		if (isArray(value)) {
			for (let i = 0; i < value.length; i++) {
				const childItem = value[i];

				if (!isVoid(childItem) && typeof childItem === 'object') {
					const tree = childItem && childItem.tree;

					if (!isVoid(tree)) {
						const childNode = childItem.tree.dom.create(childItem, treeLifecycle, context);

						if (childItem.key === undefined) {
							node.keyedChildren = false;
						}
						node.childNodeList.push(childNode);
						domNode.appendChild(childNode);
					} else {
						const childNode = childItem.create(value.overrideItem || childItem, treeLifecycle, context);

						if (childItem.key === undefined) {
							node.keyedChildren = false;
						}
						node.childNodeList.push(childNode);
						domNode.appendChild(childNode);
					}
				} else if (isStringOrNumber(childItem)) {
					const textNode = document.createTextNode(childItem);

					domNode.appendChild(textNode);
					node.childNodeList.push(textNode);
					node.keyedChildren = false;
				}
			}
		} else if (typeof value === 'object') {
			const tree = value && value.tree;

			if (tree) {
				domNode.appendChild(value.tree.dom.create(value, treeLifecycle, context));
			} else if (value.create) {
				domNode.appendChild(value.create(value, treeLifecycle, context));
			}
		} else if (isStringOrNumber(value)) {
			domNode.textContent = value;
		}
	}
}

export function updateDynamicChild(lastItem, nextItem, lastValue, nextValue, domNode, node, treeLifecycle, context, recreate) {
	if (nextValue !== lastValue) {
		if (nextValue && isVoid(lastValue)) {
			if (typeof nextValue === 'object') {
				if (isArray(nextValue)) {
					updateAndAppendDynamicChildren(domNode, nextValue);
				} else {
					recreate(domNode, lastItem, nextItem, node, treeLifecycle, context);
				}

			} else {
				domNode.appendChild(document.createTextNode(nextValue));
			}
		} else if (lastValue && isVoid(nextValue)) {
			if (isArray(lastValue)) {
				for (let i = 0; i < lastValue.length; i++) {
					if (!isVoid(domNode.childNodes[i])) {
						domNode.removeChild(domNode.childNodes[i]);
					} else {
						removeChild(domNode);
					}
				}
			} else {
				removeChild(domNode);
			}
		} else if (isStringOrNumber(nextValue)) {
			appendText(domNode, nextValue);
		} else if (isVoid(nextValue)) {
			if (domNode !== null) {
				replaceChild(domNode, document.createTextNode(''));
			}
		} else if (isArray(nextValue)) {
			if (isArray(lastValue)) {
				if (node.keyedChildren) {
					updateKeyed(nextValue, lastValue, domNode, null, treeLifecycle, context);
				} else {
					updateNonKeyed(nextValue, lastValue, node.childNodeList, domNode, null, treeLifecycle, context);
				}
			} else {
				recreate(domNode, lastItem, nextItem, node, treeLifecycle, context);
			}
		} else if (typeof nextValue === 'object') {
			const tree = nextValue && nextValue.tree;
			if (!isVoid(tree)) {
				if (!isVoid(lastValue)) {
					const oldTree = lastValue && lastValue.tree;

					if (!isVoid(oldTree)) {
						tree.dom.update(lastValue, nextValue, treeLifecycle, context);
					} else {
						recreate(domNode, lastItem, nextItem, node, treeLifecycle, context);
					}
				} else {
					replaceChild(domNode, tree.dom.create(nextValue, treeLifecycle, context));
				}
			} else if (nextValue.create) {
				// TODO
			} else {
				removeChild(domNode);
			}
		}
	}
}
