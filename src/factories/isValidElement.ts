import {
	isVElement,
	isVComponent,
	isOptVElement,
	VElement
} from '../core/shapes';
import {
	isNull,
	isObject
} from './../shared';

export default function isValidElement(obj: VElement) {
	const isNotANullObject = isObject(obj) && isNull(obj) === false;
	if (isNotANullObject === false) {
		return false;
	}
	return isVElement(obj) || isVComponent(obj) || isOptVElement(obj);
};
