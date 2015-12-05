import { remove } from './domController';

const rootFragments = [];

export function getRootFragmentAtNode(node) {
	const rootFragmentsLength = rootFragments.length;

	if (rootFragmentsLength === 0) {
		return null;
	}
	for (let i = 0; i < rootFragmentsLength; i++) {
		const rootFragment = rootFragments[i];
		if (rootFragment.parentNode === node) {
			return rootFragment;
		}
	}
	return null;
}

export function removeRootFragment(rootFragment) {
	for (let i = 0; i < rootFragments.length; i++) {
		if (rootFragments[i] === rootFragment) {
			rootFragments.splice(i, 1);
			return true;
		}
	}
	return false;
}

export function createFragment(parentNode, nextNode) {
	let lastItem;
	const fragment =  {
		parentNode,
		render(nextItem) {
			const tree = nextItem.tree;

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

export function render(nextItem, parentNode) {
	const rootFragment = getRootFragmentAtNode(parentNode);

	if (rootFragment === null) {
		const fragment = createFragment(parentNode);
		fragment.render(nextItem);
		rootFragments.push(fragment);
	} else {
		if (nextItem === null) {
			rootFragment.remove();
			removeRootFragment(rootFragment);
		} else {
			rootFragment.render(nextItem);
		}
	}
}

export function renderToString(nextItem) {
	// TODO
}