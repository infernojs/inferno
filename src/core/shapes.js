import { isUndefined, isNull } from './utils';

export const NULL_INDEX = -1;
export const ROOT_INDEX = -2;

export const NodeTypes = {
	TEMPLATE: 1,
	TEXT: 2
};

export function createVTemplate(bp, key, v0, v1, v2, v3) {
	return {
		bp,
		dom: null,
		key,
		type: NodeTypes.TEMPLATE,
		v0,
		v1,
		v2,
		v3
	};
}

export function createVText(text) {
	return {
		dom: null,
		text,
		type: NodeTypes.TEXT
	};
}

export function isVTemplate(o) {
	return o.type === NodeTypes.TEMPLATE;
}

export function isVText(o) {
	return o.type === NodeTypes.TEXT;
}