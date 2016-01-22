import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners, handleHooks } from '../addAttributes';

export default function createVoidNode(templateNode, dynamicAttrs, staticNode) {
	const domNodeMap = {};
	const node = {
		overrideItem: null,
		create(item, treeLifecycle) {
			const domNode = templateNode.cloneNode(true);

			if (staticNode) {
				return domNode;
			}

			if (dynamicAttrs) {
				addDOMDynamicAttributes(item, domNode, dynamicAttrs, node, 'onCreated');
				if (dynamicAttrs.onAttached) {
					treeLifecycle.addTreeSuccessListener(() => {
						handleHooks(item, dynamicAttrs, domNode, 'onAttached');
					});
				}
			}
			domNodeMap[item.id] = domNode;
			return domNode;
		},
		update(lastItem, nextItem) {
			if ( !staticNode) {
				const domNode = domNodeMap[lastItem.id];
				if (dynamicAttrs) {
					if (dynamicAttrs.onWillUpdate) {
						handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
					}
					updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
					if (dynamicAttrs.onDidUpdate) {
						handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
					}
				}
			}
		},
		remove(item) {
			if (!staticNode) {
				const domNode = domNodeMap[item.id];

				if (dynamicAttrs) {
					if (dynamicAttrs.onWillDetach) {
						handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
					}
					clearListeners(item, domNode, dynamicAttrs);
				}
			}
		},
		hydrate() {}
	};

	return node;
}
