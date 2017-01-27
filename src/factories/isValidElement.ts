import { VNode } from 'inferno';
import VNodeFlags from 'inferno-vnode-flags';
import {
	isNull,
	isObject
} from 'inferno-helpers';

export default function isValidElement(obj: VNode): boolean {
	const isNotANullObject = isObject(obj) && isNull(obj) === false;
	if (isNotANullObject === false) {
		return false;
	}
	const flags = obj.flags;

	return (flags & (VNodeFlags.Component | VNodeFlags.Element)) > 0;
};
