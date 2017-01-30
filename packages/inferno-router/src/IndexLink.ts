import { createVNode, VNode } from 'inferno';
import Link from './Link';
import VNodeFlags from 'inferno-vnode-flags';

export default function IndexLink (props): VNode {
	props.to = '/';
	return createVNode(VNodeFlags.ComponentFunction, Link, props);
}
