import { createVNode } from 'inferno';
import Link from './Link';

export default function IndexLink(props) {
	props.to = '/';
	return createVNode(VNodeFlags.ComponentFunction, Link, props);
}
