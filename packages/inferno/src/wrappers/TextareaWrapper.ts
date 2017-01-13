import {
	EMPTY_OBJ,
	isNullOrUndef
} from '../../shared';
import { wrappers } from './processElement';

function isControlled(props) {
	return !isNullOrUndef(props.value);
}

function wrappedOnChange(e) {
	let vNode = this.vNode;
	const events = vNode.events || EMPTY_OBJ;
	const event = events.onChange;

	if (event.event) {
		event.event(event.data, e);
	} else {
		event(e);
	}
}

function onTextareaInputChange(e) {
	let vNode = this.vNode;
	const events = vNode.events || EMPTY_OBJ;
	const dom = vNode.dom;

	if (events.onInput) {
		const event = events.onInput;

		if (event.event) {
			event.event(event.data, e);
		} else {
			event(e);
		}
	} else if (events.oninput) {
		events.oninput(e);
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
			if (props.onChange) {
				dom.onchange = wrappedOnChange.bind(textareaWrapper);
				dom.onchange.wrapped = true;
			}
			wrappers.set(dom, textareaWrapper);
		}
		textareaWrapper.vNode = vNode;
	}
}

export function applyValue(vNode, dom) {
	const props = vNode.props || EMPTY_OBJ;
	const value = props.value;

	if (dom.value !== value) {
		if (!isNullOrUndef(value)) {
			dom.value = value;
		}
	}
}
