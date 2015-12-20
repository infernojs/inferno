import isArray from '../../util/isArray';
import { isRecyclingEnabled, recycle } from '../recycling';
import recreateRootNode from '../recreateRootNode';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootStaticNode(templateNode) {
	const node = {
		pool: [],
		keyedPool: [],
		create(item) {
			let domNode;
			if (recyclingEnabled) {
				domNode = recycle(node, item);
				if (domNode) {
					return domNode;
				}
			}
			domNode = templateNode.cloneNode(true);
			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem) {
			if (node !== lastItem.domTree) {
				recreateRootNode(lastItem, nextItem, node);
				return;
			}
			nextItem.rootNode = lastItem.rootNode;
		},
    remove(lastItem) {

    }
	};
	return node;
}
