import isArray from '../../util/isArray';
import { isRecyclingEnabled, recycle } from '../recycling';
import { getValueWithIndex } from '../../core/variables';
import { updateKeyed } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs, domNamespace) {
	const node = {
		pool: [],
		keyedPool: [],
		create(item, treeLifecycle) {
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
						domNode.appendChild(subTree.create(item, treeLifecycle));
					}
				} else if (typeof subTreeForChildren === 'object') {
					domNode.appendChild(subTreeForChildren.create(item, treeLifecycle));
				}
			}
			if (dynamicAttrs) {
				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
			}
			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle) {
			if (node !== lastItem.domTree) {
				recreateRootNode(lastItem, nextItem, node, treeLifecycle);
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;
			if (subTreeForChildren != null) {
				if (isArray(subTreeForChildren)) {
					for (let i = 0; i < subTreeForChildren.length; i++) {
						const subTree = subTreeForChildren[i];
						subTree.update(lastItem, nextItem, treeLifecycle);
					}
				} else if (typeof subTreeForChildren === 'object') {
					subTreeForChildren.update(lastItem, nextItem, treeLifecycle);
				}
			}
			if (dynamicAttrs) {
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
			}
		},
    remove(item, treeLifecycle) {
      if (subTreeForChildren != null) {
        if (isArray(subTreeForChildren)) {
          for (let i = 0; i < subTreeForChildren.length; i++) {
            const subTree = subTreeForChildren[i];
            subTree.remove(item, treeLifecycle);
          }
        } else if (typeof subTreeForChildren === 'object') {
          subTreeForChildren.remove(item, treeLifecycle);
        }
      }
    }
	};
	return node;
}
