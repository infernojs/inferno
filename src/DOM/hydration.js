export function canHydrate(domNode) {
	if (domNode.firstChild) {
		debugger;
		if (domNode.hasAttribute('inferno')) {
			return true;
		} else {
			// otherwise clear the DOM node
			domNode.innerHTML = '';
		}
	}
}