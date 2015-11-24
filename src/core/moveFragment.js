export default function moveFragment(parentDom, item, nextItem) {
	let domItem = item.dom;
	let	domRefItem = nextItem && nextItem.dom;

	if (domItem !== domRefItem) {
		let activeFragment = document.activeElement;

		if (domRefItem) {
			parentDom.insertBefore(domItem, domRefItem);
		} else {
			parentDom.appendChild(domItem);
		}
		if (activeFragment !== document.body && (document.activeElement !== activeFragment)) {
			activeFragment.focus();
		}
	}
};
