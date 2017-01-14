import {
	isNull,
	isObject,
} from 'inferno-helpers';

export default function isValidElement(obj: VNode): boolean {
	const isNotANullObject = isObject(obj) && isNull(obj) === false;
	if (isNotANullObject === false) {
		return false;
	}
	const flags = obj.flags;

	return Boolean(flags & (VNodeFlags.Component | VNodeFlags.Element));
};
