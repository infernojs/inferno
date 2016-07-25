import { createVElement } from '../core/shapes';
import { convertToHashbang } from './utils';

export default function Link({ to, children }, { hashbang, history }) {
	return (createVElement('a').setProps({
		href: hashbang ? history.getHashbangRoot() + convertToHashbang('#!' + to) : to
	}).setChildren(children));
}
