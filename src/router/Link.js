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

	return element.setTag('a').setAttrs({ href }).setChildren(props.children);
}