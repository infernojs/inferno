import { createVNode } from '../core/shapes';
import { convertToHashbang } from './utils';

export default function Link(props, { hashbang, history }) {
	const { activeClassName, activeStyle, className, to } = props;
	const element = createVNode();
	const href = hashbang ? history.getHashbangRoot() + convertToHashbang('#!' + to) : to;

	if (className) {
		element.setClassName(className);
	}

	if (history.isActive(to, hashbang)) {
		if (activeClassName) {
			element.setClassName((className ? className + ' ' : '') + activeClassName);
		}
		if (activeStyle) {
			element.setStyle(Object.assign({}, props.style, activeStyle));
		}
	}

	if (!hashbang) {
		element.setEvents({
			onclick: function navigate(e) {
				if (e.button !== 0 || e.ctrlKey || e.altKey) {
					return;
				}
				
				e.preventDefault();
				const target = e.target;
				window.history.pushState(null, target.textContent, to);
				history.routeTo(to);
			}
		});
	}

	return element.setTag('a').setAttrs({ href }).setChildren(props.children);
}
