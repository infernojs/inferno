import { createVElement } from '../core/shapes';
import { convertToHashbang } from './utils';

export default function Link(props, { hashbang, history }) {
	const { activeClassName, activeStyle, className, to } = props;
	const element = createVElement('a');
	const href = hashbang ? history.getHashbangRoot() + convertToHashbang('#!' + to) : to;

	if (className) {
		element.className(className);
	}

	if (history.isActive(to, hashbang)) {
		if (activeClassName) {
			element.className((className ? className + ' ' : '') + activeClassName);
		}
		if (activeStyle) {
			element.style(Object.assign({}, props.style, activeStyle));
		}
	}

	if (!hashbang) {
		element.events({
			onclick: function navigate(e) {
				e.preventDefault();
				const target = e.target;
				window.history.pushState(null, target.textContent, to);
				history.routeTo(to);
			}
		});
	}

	return element.props({ href }).children(props.children);
}