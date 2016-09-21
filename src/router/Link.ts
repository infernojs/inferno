import { createVElement } from '../core/shapes';
import { convertToHashbang } from './utils';

export default function Link(props, { hashbang, history }) {
	const { activeClassName, activeStyle, className, to } = props;
	const href = hashbang ? history.getHashbangRoot() + convertToHashbang('#!' + to) : to;
	const elemProps: any = { href };
	const element = createVElement('a', elemProps, props.children, null, null, null);

	if (className) {
		elemProps.className = className;
	}

	if (history.isActive(to, hashbang)) {
		if (activeClassName) {
			elemProps.className = (className ? className + ' ' : '') + activeClassName;
		}
		if (activeStyle) {
			elemProps.style = Object.assign({}, props.style, activeStyle);
		}
	}

	if (!hashbang) {
		elemProps.onclick = function navigate(e) {
			if (e.button !== 0 || e.ctrlKey || e.altKey) {
				return;
			}
			e.preventDefault();
			const target = e.target;
			window.history.pushState(null, target.textContent, to);
			history.routeTo(to);
		};
	}

	return element;
}
