import createElement from 'inferno-create-element';

interface ILinkProps {
	href: any;
	className?: string;
	activeClassName?: string;
	style?: any;
	activeStyle?: any;
	onclick?: (event?: any) => void;
}

export default function Link(props, { router }) {
	const { activeClassName, activeStyle, className, onClick, to } = props;
	const elemProps: ILinkProps = {
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
		if (typeof onClick === 'function') {
			onClick();
		}
		router.push(to, e.target.textContent);
	};

	return createElement('a', elemProps, props.children);
}
