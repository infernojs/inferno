import { remove } from './domMutate';

export default function createDOMFragment(parentNode, nextNode) {
	let lastItem;
	const _componentTree = [];
	const treeSuccessListeners = [];
	const treeLifecycle = {
		addTreeSuccessListener(listener) {
			treeSuccessListeners.push(listener);
		},
		removeTreeSuccessListener(listener) {
			for (let i = 0; i < treeSuccessListeners.length; i++) {
				const treeSuccessListener = treeSuccessListeners[i];

				if (treeSuccessListener === listener) {
					treeSuccessListeners.splice(i, 1);
					return;
				}
			}
		}
	};
	const fragment =  {
		parentNode,
		_componentTree,
		render(nextItem) {
			if (!nextItem) {
				return;
			}
			const tree = nextItem.domTree;

			if (lastItem) {
				tree.update(lastItem, nextItem, _componentTree, treeLifecycle);
			} else {
				const dom = tree.create(nextItem, _componentTree, treeLifecycle);

				if (nextNode) {
					parentNode.insertBefore(dom, nextNode);
				} else if (parentNode) {
					parentNode.appendChild(dom);
				}
			}
			lastItem = nextItem;
			return fragment;
		},
		remove() {
			remove(lastItem, parentNode);
			return fragment;
		}
	};
	return fragment;
}
