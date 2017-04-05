import { isArray, isInvalid, isNullOrUndef } from 'inferno-shared';
import { isVNode } from '../../core/VNodes';
import { EMPTY_OBJ } from '../utils';

function updateChildOptionGroup(vNode, value) {
	const type = vNode.type;

	if (type === 'optgroup') {
		const children = vNode.children;

		if (isArray(children)) {
			for (let i = 0, len = children.length; i < len; i++) {
				updateChildOption(children[ i ], value);
			}
		} else if (isVNode(children)) {
			updateChildOption(children, value);
		}
	} else {
		updateChildOption(vNode, value);
	}
}

function updateChildOption(vNode, value) {
	const props = vNode.props || EMPTY_OBJ;
	const dom = vNode.dom;

	// we do this as multiple may have changed
	dom.value = props.value;
	if ((isArray(value) && value.indexOf(props.value) !== -1) || props.value === value) {
		dom.selected = true;
	} else if (!isNullOrUndef(value) || !isNullOrUndef(props.selected)) {
		dom.selected = props.selected || false;
	}
}

function onSelectChange(e) {
	const vNode = this;
	const props = vNode.props || EMPTY_OBJ;
	const dom = vNode.dom;
	const previousValue = props.value;

	if (props.onChange) {
		const event = props.onChange;

		if (event.event) {
			event.event(event.data, e);
		} else {
			event(e);
		}
	} else if (props.onchange) {
		props.onchange(e);
	}
	// the user may have updated the vNode from the above onInput events syncronously
	// so we need to get it from the context of `this` again
	const newVNode = this;
	const newProps = newVNode.props || EMPTY_OBJ;

	// If render is going async there is no value change yet, it will come back to process input soon
	if (previousValue !== newProps.value) {
		// When this happens we need to store current cursor position and restore it, to avoid jumping

		applyValue(newVNode, dom, newProps, false);
	}
}

export function processSelect(vNode, dom, nextPropsOrEmpty, mounting: boolean, isControlled: boolean) {
	applyValue(vNode, dom, nextPropsOrEmpty, mounting);

	if (mounting && isControlled) {
		dom.onchange = onSelectChange.bind(vNode);
		dom.onchange.wrapped = true;
	}
}

export function applyValue(vNode, dom, nextPropsOrEmpty, mounting: boolean) {
	if (nextPropsOrEmpty.multiple !== dom.multiple) {
		dom.multiple = nextPropsOrEmpty.multiple;
	}
	const children = vNode.children;

	if (!isInvalid(children)) {
		let value = nextPropsOrEmpty.value;
		if (mounting && isNullOrUndef(value)) {
			value = nextPropsOrEmpty.defaultValue;
		}
		if (isArray(children)) {
			for (let i = 0, len = children.length; i < len; i++) {
				updateChildOptionGroup(children[ i ], value);
			}
		} else if (isVNode(children)) {
			updateChildOptionGroup(children, value);
		}
	}
}
