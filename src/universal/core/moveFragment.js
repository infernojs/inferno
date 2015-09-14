export default (parentDom, item, nextItem) => {

	let domItem = item.dom,
		domRefItem = nextItem && nextItem.dom;

	if (domItem !== domRefItem) {

		let activeFragment = document.activeElement;

		if (domRefItem) {

			parentDom.insertBefore(domItem, domRefItem);

		} else {

			parentDom.appendChild(domItem);
		}

		if (activeFragment != document.body && (document.activeElement !== activeFragment)) {
			activeDomNode.focus();
		}
	}
};
