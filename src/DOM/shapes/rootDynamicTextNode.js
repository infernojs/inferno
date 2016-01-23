import isVoid from '../../util/isVoid';
import isStringOrNumber from '../../util/isStringOrNumber';
import { recycle } from '../recycling';
import { getValueWithIndex } from '../../core/variables';
import recreateRootNode from '../recreateRootNode';

export default function createRootDynamicTextNode(templateNode, valueIndex, recyclingEnabled) {
	const node = {
		pool: [],
		keyedPool: [],
		overrideItem: null,
		create(item) {
			let domNode;

			if (recyclingEnabled) {
				domNode = recycle(node, item);
				if (domNode) {
					return domNode;
				}
			}
			domNode = templateNode.cloneNode(false);
			const value = getValueWithIndex(item, valueIndex);

			if (!isVoid(value) && isStringOrNumber(value)) {
				domNode.nodeValue = value;
			}
			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle) {
			const domNode = lastItem.rootNode;
			const tree = lastItem && lastItem.tree;

			if (tree && (node !== tree.dom)) {
				recreateRootNode(domNode, lastItem, nextItem, node, treeLifecycle);
				return;
			}
			const nextValue = getValueWithIndex(nextItem, valueIndex);
			const lastValue = getValueWithIndex(lastItem, valueIndex);

			if (nextValue !== lastValue && (isStringOrNumber(nextValue))) {
				domNode.nodeValue = nextValue;
			}
		},
		remove() {}
	};

	return node;
}
