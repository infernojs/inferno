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
			if (tree && (node !== tree)) {
				recreateRootNode(lastItem, nextItem, node, treeLifecycle);
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;
			nextItem.id = lastItem.id;
			const nextValue = getValueWithIndex(nextItem, valueIndex);

			if (nextValue !== getValueWithIndex(lastItem, valueIndex) && (isStringOrNumber(nextValue))) {
				domNode.nodeValue = nextValue;
			}
		},
		remove() {}
	};

	return node;
}
