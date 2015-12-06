import { getValueWithIndex } from '../../core/variables';

export default function createNodeWithDynamicText(templateNode, valueIndex) {
	const node = {
		create(item) {
			let domNode;

			domNode = templateNode.cloneNode(false);
			const value = getValueWithIndex(item, valueIndex);

			if(value != null) {
				domNode.textContent = value;
			}
			return domNode;
		},
		update(lastItem, nextItem) {
			let domNode;

			if (node !== lastItem.domTree) {
				const lastDomNode = lastItem.rootNode;
				domNode = this.create(nextItem);
				lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
				return;
			}

			domNode = lastItem.rootNode;
			nextItem.rootNode = domNode;
			const nextValue = getValueWithIndex(nextItem, valueIndex);

			if (nextValue !== getValueWithIndex(lastItem, valueIndex)) {
				domNode.firstChild.nodeValue = nextValue;
			}
		}
	};
	return node;
}