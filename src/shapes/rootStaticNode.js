import isArray from '../util/isArray';
import { isRecyclingEnabled, recycle } from '../core/recycling';
import { updateKeyed } from '../core/domController';

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
			nextItem.rootNode = lastItem.rootNode;
		}
	};
	return node;
}
