import { detachNode, removeChild, isVList } from './utils';

export function unmountVList(vList, parentDom, removePointer) {
	const items = vList.items;
	const itemsLength = items.length;
	const pointer = items.pointer;

	if (itemsLength > 0) {
		for (let i = 0; i < itemsLength; i++) {
			const item = items[i];

			if (isVList(item)) {
				unmountVList(item, parentDom, true);
			} else {
				removeChild(parentDom, item.dom);
				detachNode(item);
			}
		}
	}
	if (removePointer) {
		removeChild(parentDom, pointer);
	}
}