import {
	EMPTY_OBJ,
	isNullOrUndef
} from './../../shared';
import { wrappers } from './processElement';
// import { isVNode } from '../../core/shapes';

function isControlled(props) {
	return !isNullOrUndef(props.value);
}

function onTextareaInputChange(e) {
	let vNode = this.vNode;
	const props = vNode.props;
	const dom = vNode.dom;

	if (props.onInput) {
		props.onInput(e);
	} else if (props.oninput) {
		props.oninput(e);
	}
	// the user may have updated the vNode from the above onInput events
	// so we need to get it from the context of `this` again
	applyValue(this.vNode, dom);
}

export function processTextarea(vNode, dom) {
	const props = vNode.props || EMPTY_OBJ;
	applyValue(vNode, dom);
	let textareaWrapper = wrappers.get(dom);

	if (isControlled(props)) {
		if (!textareaWrapper) {
			textareaWrapper = {
				vNode
			};
			dom.oninput = onTextareaInputChange.bind(textareaWrapper);
			dom.oninput.wrapped = true;
			wrappers.set(dom, textareaWrapper);
		}
	}
}

export function applyValue(vNode, dom) {
	const props = vNode.props || EMPTY_OBJ;
	const value = props.value;

	if (dom.value !== value) {
		dom.value = value;
	}
}
