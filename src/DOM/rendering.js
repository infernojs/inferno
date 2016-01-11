import createDOMFragment from '../DOM/createFragment';
import isVoid from '../util/isVoid';

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

export function render(nextItem, parentNode) {
	const rootFragment = getRootFragmentAtNode(parentNode);

	if (isVoid(rootFragment)) {
		const fragment = createDOMFragment(parentNode);

		fragment.render(nextItem);
		rootFragments.push(fragment);
	} else {
		if (isVoid(nextItem)) {
			rootFragment.remove();
			removeRootFragment(rootFragment);
		} else {
			rootFragment.render(nextItem);
		}
	}
}
