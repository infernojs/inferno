import { createVNode, VNode } from 'inferno';
import { combineFrom, isBrowser } from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';

export default function Link(props, { router }): VNode {
	const { activeClassName, activeStyle, className, onClick, children, to, ...otherProps } = props;

	otherProps.href = isBrowser ? router.createHref({ pathname: to }) : router.location.baseUrl ? router.location.baseUrl + to : to;

	let classNm;
	if (className) {
		classNm = className as string;
	}

	if (router.location.pathname === to) {
		if (activeClassName) {
			classNm = (className ? className + ' ' : '') + activeClassName;
		}
		if (activeStyle) {
			otherProps.style = combineFrom(props.style, activeStyle);
		}
	}

	otherProps.onclick = function navigate(e) {
		if (e.button !== 0 || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
			return;
		}
		e.preventDefault();
		if (typeof onClick === 'function') {
			onClick(e);
		}
		router.push(to, e.target.textContent);
	};

	return createVNode(VNodeFlags.HtmlElement, 'a', classNm, children, otherProps);
}
