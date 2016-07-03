import { createVNode } from '../core/shapes';
import { convertToHashbang } from './utils';

export default function Link({ to, children }, { hashbang, history }) {
	return (createVNode().setAttrs({
		href: hashbang ? history.getHashbangRoot() + convertToHashbang('#!' + to) : to
	}).setTag('a').setChildren(children));
}
