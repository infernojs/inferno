import { remove } from './domMutate';
import { canHydrate } from './hydration';

function createTreeLifecycle() {
	const treeLifecycle = {
		treeSuccessListeners: [],
		addTreeSuccessListener(listener) {
			treeLifecycle.treeSuccessListeners.push(listener);
		},
		removeTreeSuccessListener(listener) {
			for (let i = 0; i < treeLifecycle.treeSuccessListeners.length; i++) {
				const treeSuccessListener = treeLifecycle.treeSuccessListeners[i];

				if (treeSuccessListener === listener) {
					treeLifecycle.treeSuccessListeners.splice(i, 1);
					return;
				}
			}
		},
		reset() {
			treeLifecycle.treeSuccessListeners = [];
		},
		trigger() {
			if (treeLifecycle.treeSuccessListeners.length > 0) {
				for (let i = 0; i < treeLifecycle.treeSuccessListeners.length; i++) {
					treeLifecycle.treeSuccessListeners[i]();
				}
			}
		}
	};
	return treeLifecycle;
}

export default function createDOMFragment(parentNode, nextNode) {
	let lastItem;
	const context = {};
	const treeLifecycle = createTreeLifecycle();
	return {
		parentNode,
		render(nextItem) {
			if (nextItem) {
				const tree = nextItem.tree && nextItem.tree.dom;

				if (tree) {
					const activeNode = document.activeElement;

					if (lastItem) {
						tree.update(lastItem, nextItem, treeLifecycle, context);

						if (!nextItem.rootNode) {
							lastItem = null;
							return;
						}
					} else {
						if (tree) {
							const hydrateNode = parentNode.firstChild;

							if (canHydrate(parentNode, hydrateNode)) {
								tree.hydrate(hydrateNode, nextItem, treeLifecycle, context);
							} else {
								const dom = tree.create(nextItem, treeLifecycle, context);

								if (!dom) {
									return;
								}
								if (nextNode) {
									parentNode.insertBefore(dom, nextNode);
								} else if (parentNode) {
									parentNode.appendChild(dom);
								}
							}
						}
					}
					treeLifecycle.trigger();
					lastItem = nextItem;
					if (activeNode !== document.body && document.activeElement !== activeNode) {
						activeNode.focus();
					}
				}
			}
		},
		remove() {
			if (lastItem) {
				const tree = lastItem.tree.dom;

				if (lastItem) {
					tree.remove(lastItem, treeLifecycle);
				}
				if (lastItem.rootNode.parentNode) {
					remove(lastItem, parentNode);
				}
			}
			treeLifecycle.treeSuccessListeners = [];
		}
	};
}
