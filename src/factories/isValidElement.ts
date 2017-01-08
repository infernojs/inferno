import {
	isNull,
	isObject
} from '../shared';

export default function isValidElement(obj: VNode): boolean {
	const isNotANullObject = isObject(obj) && isNull(obj) === false;
	if (isNotANullObject === false) {
		return false;
	}
	const flags = obj.flags;

	return !!(flags & (VNodeFlags.Component | VNodeFlags.Element)) as boolean;
};
