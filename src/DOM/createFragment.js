import { remove } from './domMutate';

export default function createDOMFragment(parentNode, nextNode) {
	let lastItem;
	const fragment =  {
		parentNode,
		render(nextItem) {
			if (!nextItem) {
				return;
			}

			const tree = nextItem.domTree;

			if (lastItem) {
				tree.update(lastItem, nextItem);
			} else {
				const dom = tree.create(nextItem);

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
