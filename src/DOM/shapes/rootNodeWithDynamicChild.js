import isArray from '../../util/isArray';
import { isRecyclingEnabled, recycle } from '../recycling';
import { getValueWithIndex, removeValueTree } from '../../core/variables';
import { updateKeyed, updateNonKeyed } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs, domNamespace) {
	let keyedChildren = true;
	let childNodeList = [];
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
			const value = getValueWithIndex(item, valueIndex);

			if (value != null) {
				if (isArray(value)) {
					for (let i = 0; i < value.length; i++) {
						const childItem = value[i];

						if (typeof childItem === 'object') {
							const childNode = childItem.domTree.create(childItem, treeLifecycle);

							if (childItem.key === undefined) {
								keyedChildren = false;
							}
							childNodeList.push(childNode);
							domNode.appendChild(childNode);
						} else if (typeof childItem === 'string' || typeof childItem === 'number') {
							const textNode = document.createTextNode(childItem);

							domNode.appendChild(textNode);
							childNodeList.push(textNode);
							keyedChildren = false;
						}
					}
				} else if (typeof value === 'object') {
					domNode.appendChild(value.domTree.create(value, treeLifecycle));
				} else if (typeof value === 'string' || typeof value === 'number') {
					domNode.textContent = value;
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
			const nextValue = getValueWithIndex(nextItem, valueIndex);
			const lastValue = getValueWithIndex(lastItem, valueIndex);

			if (nextValue !== lastValue) {
				if (typeof nextValue === 'string') {
					domNode.firstChild.nodeValue = nextValue;
				} else if (nextValue == null) {
					if (domNode !== null) {
						const childNode = document.createTextNode('');
						domNode.replaceChild(childNode, domNode.firstChild);
					}
				} else if (isArray(nextValue)) {
					if (isArray(lastValue)) {
						if (keyedChildren) {
							updateKeyed(nextValue, lastValue, domNode, null);
						} else {
							updateNonKeyed(nextValue, lastValue, childNodeList, domNode, null, treeLifecycle);
						}
					} else {
						// do nothing for now!
					}
				} else if (typeof nextValue === 'object') {
					const tree = nextValue.domTree;

					if (tree != null) {
						if (lastValue != null) {
							if (lastValue.domTree != null) {
								tree.update(lastValue, nextValue, treeLifecycle);
							} else {
								recreateRootNode(lastItem, nextItem, node, treeLifecycle);
								return;
							}
						} else {
							const childNode = tree.create(nextValue, treeLifecycle);
							domNode.replaceChild(childNode, domNode.firstChild);
						}
					}
				} else if (typeof nextValue === 'string' || typeof nextValue === 'number') {
					domNode.firstChild.nodeValue = nextValue;
				}
			}
			if (dynamicAttrs) {
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
			}
		},
    remove(item, treeLifecycle) {
      const value = getValueWithIndex(item, valueIndex);

      removeValueTree(value, treeLifecycle);
    }
	};
	return node;
}
