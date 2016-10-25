import {
	VElement
} from '../core/shapes';
import {
	isNull,
	isObject
} from './../shared';
import {
	ELEMENT,
	COMPONENT,
	OPT_ELEMENT
} from '../core/NodeTypes';

export default function isValidElement(obj: VElement) {
	const isNotANullObject = isObject(obj) && isNull(obj) === false;
	if (isNotANullObject === false) {
		return false;
	}
	const nodeType = obj.nodeType;

	return nodeType === ELEMENT || nodeType === COMPONENT || nodeType === OPT_ELEMENT;
};
