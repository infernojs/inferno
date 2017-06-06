import { createVNode, VNode } from 'inferno';
import { combineFrom, isBrowser, warning } from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';

function renderLink(classNm, children, otherProps) {
	return createVNode(VNodeFlags.HtmlElement, 'a', classNm, children, otherProps);
}

export default function Link(props, { router }): VNode {
	const { activeClassName, activeStyle, className, onClick, children, to, ...otherProps } = props;

	let classNm;
	if (className) {
		classNm = className as string;
	}

	if (!router) {
		if (process.env.NODE_ENV !== 'production') {
			warning('<Link/> component used outside of <Router/>. Fallback to <a> tag.');
		}

		otherProps.href = to;
		otherProps.onClick = onClick;

		return renderLink(classNm, children, otherProps);
	}

	otherProps.href = isBrowser
		? router.createHref({ pathname: to })
		: router.location.baseUrl ? router.location.baseUrl + to : to;

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

	return renderLink(classNm, children, otherProps);
}
