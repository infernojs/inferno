import { isNullOrUndef } from 'inferno-shared';
import { EMPTY_OBJ } from '../utils';

export function isCheckedType(type) {
	return type === 'checkbox' || type === 'radio';
}

function onTextInputChange(e) {
	const vNode = this;
	const props = vNode.props || EMPTY_OBJ;
	const dom = vNode.dom;
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

		applyValue(newProps, dom);
	}
}

function wrappedOnChange(e) {
	const props = this.props || EMPTY_OBJ;
	const event = props.onChange;

	if (event.event) {
		event.event(event.data, e);
	} else {
		event(e);
	}
}

function onCheckboxChange(e) {
	e.stopPropagation(); // This click should not propagate its for internal use
	const vNode = this;
	const props = vNode.props || EMPTY_OBJ;
	const dom = vNode.dom;
	const previousValue = props.value;

	if (props.onClick) {
		const event = props.onClick;

		if (event.event) {
			event.event(event.data, e);
		} else {
			event(e);
		}
	} else if (props.onclick) {
		props.onclick(e);
	}

	// the user may have updated the vNode from the above onInput events syncronously
	// so we need to get it from the context of `this` again
	const newVNode = this;
	const newProps = newVNode.props || EMPTY_OBJ;

	// If render is going async there is no value change yet, it will come back to process input soon
	if (previousValue !== newProps.value) {
		// When this happens we need to store current cursor position and restore it, to avoid jumping

		applyValue(newProps, dom);
	}
}

export function processInput(vNode, dom, nextPropsOrEmpty, mounting: boolean, isControlled): void {
	applyValue(nextPropsOrEmpty, dom);
	if (mounting && isControlled) {
		if (isCheckedType(nextPropsOrEmpty.type)) {
			dom.onclick = onCheckboxChange.bind(vNode);
			dom.onclick.wrapped = true;
		} else {
			dom.oninput = onTextInputChange.bind(vNode);
			dom.oninput.wrapped = true;
		}
		if (nextPropsOrEmpty.onChange) {
			dom.onchange = wrappedOnChange.bind(vNode);
			dom.onchange.wrapped = true;
		}
	}
}

export function applyValue(nextPropsOrEmpty, dom) {
	const type = nextPropsOrEmpty.type;
	const value = nextPropsOrEmpty.value;
	const checked = nextPropsOrEmpty.checked;
	const multiple = nextPropsOrEmpty.multiple;
	const defaultValue = nextPropsOrEmpty.defaultValue;
	const hasValue = !isNullOrUndef(value);

	if (type && type !== dom.type) {
		dom.setAttribute('type', type);
	}
	if (multiple && multiple !== dom.multiple) {
		dom.multiple = multiple;
	}
	if (!isNullOrUndef(defaultValue) && !hasValue) {
		dom.defaultValue = defaultValue + '';
	}
	if (isCheckedType(type)) {
		if (hasValue) {
			dom.value = value;
		}
		if (!isNullOrUndef(checked)) {
			dom.checked = checked;
		}
	} else {
		if (hasValue && dom.value !== value) {
			dom.value = value;
		} else if (!isNullOrUndef(checked)) {
			dom.checked = checked;
		}
	}
}
