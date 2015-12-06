import { isRecyclingEnabled, pool } from './recycling';

const recyclingEnabled = isRecyclingEnabled();

export function updateKeyed(items, oldItems, parentNode, parentNextNode) {
	let stop = false;
	let startIndex = 0;
	let oldStartIndex = 0;
	const itemsLength = items.length;
	const oldItemsLength = oldItems.length;

	// TODO only if there are no other children
	if (itemsLength === 0 && oldItemsLength >= 5) {
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
	let startItem = itemsLength > 0 && items[startIndex];
	let oldStartItem = oldItemsLength > 0 && oldItems[oldStartIndex];
	let endItem;
	let oldEndItem;
	let nextNode;
	let oldItem;
	let item;

	// TODO don't read key too often
	outer: while (!stop && startIndex <= endIndex && oldStartIndex <= oldEndIndex) {
		stop = true;
		while (startItem.key === oldStartItem.key) {
			startItem.domTree.update(oldStartItem, startItem);
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
			endItem.domTree.update(oldEndItem, endItem);
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
			endItem.domTree.update(oldStartItem, endItem);
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
			startItem.domTree.update(oldEndItem, startItem);
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
				insertOrAppend(parentNode, item.domTree.create(item), nextNode);
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
				item.domTree.update(oldItem, item);
				// TODO optimise
				if (item.rootNode.nextSibling != (nextItem && nextItem.rootNode)) {
					nextNode = (nextItem && nextItem.rootNode) || parentNextNode;
					insertOrAppend(parentNode, item.rootNode, nextNode);
				}
			} else {
				nextNode = (nextItem && nextItem.rootNode) || parentNextNode;
				insertOrAppend(parentNode, item.domTree.create(item), nextNode);
			}
			nextItem = item;
		}
		for (let i = oldStartIndex; i <= oldEndIndex; i++) {
			oldItem = oldItems[i];
			if (oldItemsMap[oldItem.key] !== null) {
				oldItem = oldItems[oldStartIndex];
				remove(item, parentNode);
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
	parentNode.removeChild(item.rootNode);
	if (recyclingEnabled) {
		pool(item);
	}
}
