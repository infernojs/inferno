import { createVElement } from '../core/shapes';

export default function Link(props, { history }) {
	const { activeClassName, activeStyle, className, to } = props;
	const elemProps: any = { href: to };
	if (className) {
		elemProps.className = className;
	}

	if (history.location.pathname === to) {
		if (activeClassName) {
			elemProps.className = (className ? className + ' ' : '') + activeClassName;
		}
		if (activeStyle) {
			elemProps.style = Object.assign({}, props.style, activeStyle);
		}
	}

	elemProps.onclick = function navigate(e) {
		if (e.button !== 0 || e.ctrlKey || e.altKey) {
			return;
		}
		e.preventDefault();
		history.push(to, e.target.textContent);
	};

	const element = createVElement('a', elemProps, props.children, null, null, null);
	return element;
}
