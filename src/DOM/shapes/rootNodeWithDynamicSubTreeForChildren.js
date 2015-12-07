import isArray from '../../util/isArray';
import { isRecyclingEnabled, recycle } from '../recycling';
import { getValueWithIndex } from '../../core/variables';
import { updateKeyed } from '../domMutate';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootNodeWithDynamicSubTreeChildren(templateNode, subTreeForChildren, dynamicClassName, otherDynamicAttrs, domNamespace) {
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
			domNode = templateNode.cloneNode(false);

			if (subTreeForChildren != null) {
				if (isArray(subTreeForChildren)) {
					for (let i = 0; i < subTreeForChildren.length; i++) {
						const subTree = subTreeForChildren[i];
						domNode.appendChild(subTree.create(item));
					}
				} else if (typeof subTreeForChildren === 'object') {
					domNode.appendChild(subTreeForChildren.create(item));
				}
			}

			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem) {
			let domNode;

			if (node !== lastItem.domTree) {
				const lastDomNode = lastItem.rootNode;
				domNode = this.create(nextItem);
				lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
				// TODO recycle old node
				return;
			}

			domNode = lastItem.rootNode;
			nextItem.rootNode = domNode;

			if (subTreeForChildren != null) {
				if (isArray(subTreeForChildren)) {
					for (let i = 0; i < subTreeForChildren.length; i++) {
						const subTree = subTreeForChildren[i];
						subTree.update(lastItem, nextItem);
					}
				} else if (typeof subTreeForChildren === 'object') {
					subTreeForChildren.update(lastItem, nextItem);
				}
			}
		}
	};
	return node;
}
