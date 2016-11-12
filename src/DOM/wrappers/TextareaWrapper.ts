import {
	EMPTY_OBJ,
} from './../../shared';
// import wrappers from './map';
// import { isVNode } from '../../core/shapes';

export function processTextarea(vNode, dom) {
	applyValue(vNode, dom);
}

export function applyValue(vNode, dom) {
	const props = vNode.props || EMPTY_OBJ;
	const value = props.value;

	if (dom.value !== value) {
		dom.value = value;
	}
}
