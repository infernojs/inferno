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
				const newDomNode = recreateRootNode(lastItem, nextItem, node, treeLifecycle);
				nextItem.rootNode = newDomNode;
				return newDomNode;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;
			if (subTreeForChildren != null) {
				if (isArray(subTreeForChildren)) {
					for (let i = 0; i < subTreeForChildren.length; i++) {
						const subTree = subTreeForChildren[i];
						const newDomNode = subTree.update(lastItem, nextItem, treeLifecycle);

						if(newDomNode && domNode.childNodes[i] !== newDomNode) {
							domNode.replaceChild(newDomNode, domNode.childNodes[i]);
						}
					}
				} else if (typeof subTreeForChildren === 'object') {
					const newDomNode = subTreeForChildren.update(lastItem, nextItem, treeLifecycle);

					if(newDomNode) {
						const replaceNode = domNode.firstChild;

						if (replaceNode) {
							domNode.replaceChild(newDomNode, replaceNode)
						} else {
							domNode.appendChild(newDomNode);
						}
					}
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
