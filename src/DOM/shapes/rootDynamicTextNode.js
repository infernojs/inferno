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

			const tree = lastItem && lastItem.tree;

			// TODO! Is this code ever executed??
			if (tree && (node !== tree.dom)) {
				recreateRootNode(lastItem, nextItem, node, treeLifecycle);
				return;
			}

			const domNode = lastItem.rootNode;
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
