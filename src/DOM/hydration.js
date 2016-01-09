export function canHydrate(domNode, nextDomNode) {
	if (nextDomNode) {
		if (nextDomNode.hasAttribute('data-inferno')) {
			return true;
		} else {
			// otherwise clear the DOM node
			domNode.innerHTML = '';
		}
	}
}

function purgeCommentNodes(domNode, parentDom) {
	const nextSibling = domNode.nextSibling;

	if (nextSibling && nextSibling.nodeType === 8) {
		purgeCommentNodes(nextSibling, parentDom);
		parentDom.removeChild(nextSibling);
	}
}

function validateHydrateNodeChildren(hydrateNode, templateNode) {
	let templateNodeChild = templateNode.firstChild;
	let hydrateNodeChild = hydrateNode.firstChild;

	while (templateNodeChild) {
		const result = validateHydrateNode(hydrateNodeChild, templateNodeChild);
		if (!result) {
			return false;
		}
		// check when we reach a comment and remove it, as they are used to break up text nodes
		templateNodeChild = templateNodeChild.nextSibling;
		hydrateNodeChild = purgeCommentNodes(hydrateNodeChild, hydrateNode);
	}
	return true;
}

export function validateHydrateNode(hydrateNode, templateNode, item, dynamicAttrs) {
	// check nodeNames, return false if not same
	if (hydrateNode.nodeName !== templateNode.nodeName) {
		return false;
	}
	if (hydrateNode.nodeType === 1) {
		// check hydrateNode has all the same attrs as templateNode (as these will be static)
		// return false if not same
		// TODO

		// check hydrateNode has all the same attrs as dynamicAttrs+item (as these will be dyanmic),
		// passively update here and do not return false (as state could have changed) if not same
		if (dynamicAttrs && item) {
			// TODO
		}
		// check through children
		return validateHydrateNodeChildren(hydrateNode, templateNode);
	} else if (hydrateNode.nodeType === 3) {
		return hydrateNode.nodeValue === templateNode.nodeValue;
	}
}