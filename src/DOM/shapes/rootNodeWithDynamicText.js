import isVoid from '../../util/isVoid';
import isStringOrNumber from '../../util/isStringOrNumber';
import { recycle } from '../recycling';
import { getValueWithIndex } from '../../core/variables';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners, handleHooks } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';

export default function createRootNodeWithDynamicText(templateNode, valueIndex, dynamicAttrs, recyclingEnabled) {
	const node = {
		pool: [],
		keyedPool: [],
		overrideItem: null,
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

			if (!isVoid(value)) {
				if (process.env.NODE_ENV !== 'production') {
					if (!isStringOrNumber(value)) {
						throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
					}
				}
				if (value === '') {
					domNode.appendChild(document.createTextNode(''));
				} else {
					domNode.textContent = value;
				}
			}
			if (dynamicAttrs) {
				addDOMDynamicAttributes(item, domNode, dynamicAttrs, node, 'onCreated');
				if (dynamicAttrs.onAttached) {
					treeLifecycle.addTreeSuccessListener(() => {
						handleHooks(item, dynamicAttrs, domNode, 'onAttached');
					});
				}
			}
			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle) {
			if (node !== lastItem.tree.dom) {
				recreateRootNode(lastItem, nextItem, node, treeLifecycle);
			} else {
				const domNode = lastItem.rootNode;

				nextItem.id = lastItem.id;
				nextItem.rootNode = domNode;
				const nextValue = getValueWithIndex(nextItem, valueIndex);
				const lastValue = getValueWithIndex(lastItem, valueIndex);

				if (dynamicAttrs && dynamicAttrs.onWillUpdate) {
					handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
				}
				if (nextValue !== lastValue) {
					if (isVoid(nextValue)) {
						if (isVoid(lastValue)) {
							domNode.firstChild.nodeValue = '';
						} else {
							domNode.textContent = '';
						}
					} else {
						if (process.env.NODE_ENV !== 'production') {
							if (!isStringOrNumber(nextValue)) {
								throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
							}
						}

						if (isVoid(lastValue)) {
							domNode.textContent = nextValue;
						} else {
							domNode.firstChild.nodeValue = nextValue;
						}
					}
				}
				if (dynamicAttrs) {
					updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
					if (dynamicAttrs.onDidUpdate) {
						handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
					}
				}
			}
		},
		remove(item) {
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
