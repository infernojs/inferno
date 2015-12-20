import { remove } from './domMutate';

export default function createDOMFragment(parentNode, nextNode) {
	let lastItem;
	let treeSuccessListeners = [];
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
		render(nextItem) {
			if (!nextItem) {
				return;
			}
			const tree = nextItem.domTree;

			if (lastItem) {
				tree.update(lastItem, nextItem, treeLifecycle);
			} else {
				const dom = tree.create(nextItem, treeLifecycle);

				if (nextNode) {
					parentNode.insertBefore(dom, nextNode);
				} else if (parentNode) {
					parentNode.appendChild(dom);
				}
			}
			if (treeSuccessListeners.length > 0) {
				for (let i = 0; i < treeSuccessListeners.length; i++) {
					treeSuccessListeners[i]();
				}
			}
			lastItem = nextItem;
			return fragment;
		},
		remove() {
			const tree = lastItem.domTree;
			if (lastItem) {
				tree.remove(lastItem, treeLifecycle);
			}
			remove(lastItem, parentNode);
			treeSuccessListeners = [];
			return fragment;
		}
	};
	return fragment;
}
