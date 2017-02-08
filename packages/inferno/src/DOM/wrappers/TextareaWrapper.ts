import {
	isNullOrUndef
} from 'inferno-shared';
import { wrappers } from './processElement';
import { EMPTY_OBJ } from '../utils';

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
	applyValue(this.vNode, dom, false);
}

export function processTextarea(vNode, dom, mounting: boolean) {
	const props = vNode.props || EMPTY_OBJ;
	applyValue(vNode, dom, mounting);
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
		return true;
	}
	return false;
}

export function applyValue(vNode, dom, mounting: boolean) {
	const props = vNode.props || EMPTY_OBJ;
	const value = props.value;
	const domValue = dom.value;

	if (isNullOrUndef(value)) {
		if (mounting) {
			const defaultValue = props.defaultValue;

			if (!isNullOrUndef(defaultValue)) {
				if (defaultValue !== domValue) {
					dom.value = defaultValue;
				}
			} else if (domValue !== '') {
				dom.value = '';
			}
		}
	} else {
		/* There is value so keep it controlled */
		if (domValue !== value) {
			dom.value = value;
		}
	}
}
