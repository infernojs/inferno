import { render } from '../DOM/rendering';

export default function renderIntoDocument(nextItem) {
	const parentNode = document.createElement('div');

	render(nextItem, parentNode);
	return parentNode.firstChild;
}