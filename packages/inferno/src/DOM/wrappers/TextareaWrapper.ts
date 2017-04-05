import { isNullOrUndef } from 'inferno-shared';
import { EMPTY_OBJ } from '../utils';

function wrappedOnChange(e) {
	const props = this.props || EMPTY_OBJ;
	const event = props.onChange;

	if (event.event) {
		event.event(event.data, e);
	} else {
		event(e);
	}
}

function onTextareaInputChange(e) {
	const vNode = this;
	const props = vNode.props || EMPTY_OBJ;
	const previousValue = props.value;

	if (props.onInput) {
		const event = props.onInput;

		if (event.event) {
			event.event(event.data, e);
		} else {
			event(e);
		}
	} else if (props.oninput) {
		props.oninput(e);
	}

	// the user may have updated the vNode from the above onInput events syncronously
	// so we need to get it from the context of `this` again
	const newVNode = this;
	const newProps = newVNode.props || EMPTY_OBJ;

	// If render is going async there is no value change yet, it will come back to process input soon
	if (previousValue !== newProps.value) {
		// When this happens we need to store current cursor position and restore it, to avoid jumping

		applyValue(newVNode, vNode.dom, false);
	}
}

export function processTextarea(vNode, dom, nextPropsOrEmpty, mounting: boolean, isControlled: boolean) {
	applyValue(nextPropsOrEmpty, dom, mounting);

	if (mounting && isControlled) {
		dom.oninput = onTextareaInputChange.bind(vNode);
		dom.oninput.wrapped = true;
		if (nextPropsOrEmpty.onChange) {
			dom.onchange = wrappedOnChange.bind(vNode);
			dom.onchange.wrapped = true;
		}
	}
}

export function applyValue(nextPropsOrEmpty, dom, mounting: boolean) {
	const value = nextPropsOrEmpty.value;
	const domValue = dom.value;

	if (isNullOrUndef(value)) {
		if (mounting) {
			const defaultValue = nextPropsOrEmpty.defaultValue;

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
