import isArray from '../../util/isArray';
import isVoid from '../../util/isVoid';
import updateAndAppendDynamicChildren from '../../shared/updateAndAppendDynamicChildren';
import appendText from '../../util/appendText';
import removeChild from '../../core/removeChild';
import replaceChild from '../../core/replaceChild';
import isStringOrNumber from '../../util/isStringOrNumber';
import { recycle } from '../recycling';
import { getValueWithIndex, removeValueTree } from '../../core/variables';
import { updateKeyed, updateNonKeyed } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners, handleHooks } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';
import addShapeAttributes from '../addShapeAttributes';

function createDynamicChild(value, domNode, node, treeLifecycle, context) {
	if (!isVoid(value)) {
		if (isArray(value)) {
			for (let i = 0; i < value.length; i++) {
				const childItem = value[i];

				if (!isVoid(childItem) && typeof childItem === 'object') {
					const tree = childItem && childItem.tree;

					if (tree) {
						const childNode = childItem.tree.dom.create(childItem, treeLifecycle, context);

						if (childItem.key === undefined) {
							node.keyedChildren = false;
						}
						node.childNodeList.push(childNode);
						domNode.appendChild(childNode);
					}
				} else if (isStringOrNumber(childItem)) {
					const textNode = document.createTextNode(childItem);

					domNode.appendChild(textNode);
					node.childNodeList.push(textNode);
					node.keyedChildren = false;
				}
			}
		} else if (typeof value === 'object') {
			const tree = value && value.tree;

			if (tree) {
				domNode.appendChild(value.tree.dom.create(value, treeLifecycle, context));
			} else if (value.create) {
				domNode.appendChild(value.create(value, treeLifecycle, context));
			}
		} else if (isStringOrNumber(value)) {
			domNode.textContent = value;
		}
	}
}

function updateDynamicChild(lastItem, nextItem, lastValue, nextValue, domNode, node, treeLifecycle, context) {
	if (nextValue && isVoid(lastValue)) {
		if (typeof nextValue === 'object') {
			if (isArray(nextValue)) {
				updateAndAppendDynamicChildren(domNode, nextValue);
			} else {
				recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
			}

		} else {
			domNode.appendChild(document.createTextNode(nextValue));
		}
	} else if (lastValue && isVoid(nextValue)) {
		if (isArray(lastValue)) {
			for (let i = 0; i < lastValue.length; i++) {
				if (!isVoid(domNode.childNodes[i])) {
					domNode.removeChild(domNode.childNodes[i]);
				} else {
					removeChild(domNode);
				}
			}
		} else {
			removeChild(domNode);
		}
	} else if (nextValue !== lastValue) {
		if (isStringOrNumber(nextValue)) {
			appendText(domNode, nextValue);
		} else if (isVoid(nextValue)) {
			if (domNode !== null) {
				replaceChild(domNode, document.createTextNode(''));
			}
		} else if (isArray(nextValue)) {
			if (isArray(lastValue)) {
				if (node.keyedChildren) {
					updateKeyed(nextValue, lastValue, domNode, null, treeLifecycle, context);
				} else {
					updateNonKeyed(nextValue, lastValue, node.childNodeList, domNode, null, treeLifecycle, context);
				}
			} else {
				recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
			}
		} else if (nextValue instanceof Promise) {
			debugger;
		} else if (typeof nextValue === 'object') {
			const tree = nextValue && nextValue.tree;
			if (!isVoid(tree)) {
				if (!isVoid(lastValue)) {
					const oldTree = lastValue && lastValue.tree;

					if (!isVoid(oldTree)) {
						tree.dom.update(lastValue, nextValue, treeLifecycle, context);
					} else {
						recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
					}
				} else {
					replaceChild(domNode, tree.dom.create(nextValue, treeLifecycle, context));
				}
			} else if (nextValue.create) {
				// TODO
			} else {
				removeChild(domNode);
			}
		}
	}
}

export default function createRootNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs, recyclingEnabled) {
	const node = {
		keyedChildren: true,
		childNodeList: [],
		pool: [],
		keyedPool: [],
		overrideItem: null,
		create(item, treeLifecycle, context) {
			let domNode;

			if (recyclingEnabled) {
				domNode = recycle(node, item, treeLifecycle, context);
				if (domNode) {
					return domNode;
				}
			}
			domNode = templateNode.cloneNode(false);
			const value = getValueWithIndex(item, valueIndex);

			if (value instanceof Promise) {
				value.then(asyncValue => {
					createDynamicChild(asyncValue, domNode, node, treeLifecycle, context);
				});
			} else {
				createDynamicChild(value, domNode, node, treeLifecycle, context);
			}
			if (dynamicAttrs) {
				addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle);
			}
			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle, context) {
			const tree = lastItem && lastItem.tree;

			if (tree && (node !== tree.dom)) {
				node.childNodeList = [];
				recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;
			nextItem.id = lastItem.id;
			const nextValue = getValueWithIndex(nextItem, valueIndex);
			const lastValue = getValueWithIndex(lastItem, valueIndex);

			if (dynamicAttrs && dynamicAttrs.onWillUpdate) {
				handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
			}
			if (nextValue instanceof Promise) {
				nextValue.then(asyncValue => {
					updateDynamicChild(lastItem, nextItem, lastValue, asyncValue, domNode, node, treeLifecycle, context);
				});
			} else {
				updateDynamicChild(lastItem, nextItem, lastValue, nextValue, domNode, node, treeLifecycle, context);
			}
			if (dynamicAttrs) {
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
				if (dynamicAttrs.onDidUpdate) {
					handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
				}
			}
		},
		remove(item, treeLifecycle) {
			removeValueTree(getValueWithIndex(item, valueIndex), treeLifecycle);
			if (dynamicAttrs) {
				const domNode = item.rootNode;

				if (dynamicAttrs.onWillDetach) {
					handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
				}
				clearListeners(item, domNode, dynamicAttrs);
			}
		}
	};
	return node;
}
