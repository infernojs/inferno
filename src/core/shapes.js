import { isUndefined, isNull } from './utils';

export const NULL_INDEX = -1;
export const ROOT_INDEX = -2;

export const NodeTypes = {
	TEMPLATE: 0
};

export function createVTemplate(bp, key, v0, v1, v2, v3) {
	return {
		type: NodeTypes.TEMPLATE,
		bp,
		dom: null,
		key,
		v0,
		v1,
		v2,
		v3
	};
}

export function isVTemplate(o) {
	return o.type === NodeTypes.TEMPLATE;
}