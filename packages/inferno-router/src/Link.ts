import { createVNode, VNode } from 'inferno';
import VNodeFlags from 'inferno-vnode-flags';
import { isBrowser } from 'inferno-shared';

interface ILinkProps {
	href: any;
	className?: string;
	activeClassName?: string;
	style?: any;
	activeStyle?: any;
	onclick?: (event?: any) => void;
}

export default function Link(props, { router }): VNode {
	// TODO: Convert to object assign
	const { activeClassName, activeStyle, className, onClick, to, ...otherProps } = props;
	const elemProps: ILinkProps = {
		href: isBrowser ? router.createHref({pathname: to}) : router.location.baseUrl ? router.location.baseUrl + to : to,
		...otherProps
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
		if (e.button !== 0 || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
			return;
		}
		e.preventDefault();
		if (typeof onClick === 'function') {
			onClick(e);
		}
		router.push(to, e.target.textContent);
	};

	return createVNode(VNodeFlags.HtmlElement, 'a', elemProps, props.children);
}
