import { createVElement, IProps } from '../core/shapes';

export default function Link(props, { router }) {
	const { activeClassName, activeStyle, className, to } = props;
	const elemProps: IProps = {
		href: to
	};

	if (className) {
		elemProps.className = className as string;
	}

	if (router.location.pathname === to) {
		if (activeClassName) {
			elemProps.className = (className ? className + ' ' : '') + activeClassName;
		}
		if (activeStyle) {
			elemProps.style = Object.assign({}, props.style, activeStyle) as Object;
		}
	}

	elemProps.onclick = function navigate(e) {
		if (e.button !== 0 || e.ctrlKey || e.altKey) {
			return;
		}
		e.preventDefault();
		if (props.onEnter) {
			props.onEnter(props, (confirm) => {
				router.push(to, e.target.textContent);
			});
		} else {
			router.push(to, e.target.textContent);
		}
	};

	return createVElement('a', elemProps, props.children, null, null, null);
}
