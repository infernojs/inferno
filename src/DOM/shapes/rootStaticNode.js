import isArray from '../../util/isArray';
import { isRecyclingEnabled, recycle } from '../recycling';
import { updateKeyed } from '../domMutate';

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
				const lastDomNode = lastItem.rootNode;
				const domNode = this.create(nextItem);
				lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
				// TODO recycle old node
				return;
			}
			nextItem.rootNode = lastItem.rootNode;
		}
	};
	return node;
}
