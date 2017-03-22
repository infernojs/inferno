import {
	isArray,
	isInvalid,
	isNullOrUndef
} from 'inferno-shared';
import { isVNode } from '../../core/VNodes';
import { wrappers } from './processElement';
import { EMPTY_OBJ } from '../utils';

function isControlled(props) {
	return !isNullOrUndef(props.value);
}

function updateChildOptionGroup(vNode, value) {
	const type = vNode.type;

	if (type === 'optgroup') {
		const children = vNode.children;

		if (isArray(children)) {
			for (let i = 0, len = children.length; i < len; i++) {
				updateChildOption(children[i], value);
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
	const vNode = this.vNode;
	const props = vNode.props || EMPTY_OBJ;
	const dom = vNode.dom;

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
	// the user may have updated the vNode from the above onChange events
	// so we need to get it from the context of `this` again
	applyValue(this.vNode, dom, false);
}

export function processSelect(vNode, dom, mounting: boolean) {
	const props = vNode.props || EMPTY_OBJ;

	applyValue(vNode, dom, mounting);
	if (isControlled(props)) {
		let selectWrapper = wrappers.get(dom);

		if (!selectWrapper) {
			selectWrapper = {
				vNode
			};
			dom.onchange = onSelectChange.bind(selectWrapper);
			dom.onchange.wrapped = true;
			wrappers.set(dom, selectWrapper);
		}
		selectWrapper.vNode = vNode;
		return true;
	}
	return false;
}

export function applyValue(vNode, dom, mounting: boolean) {
	const props = vNode.props || EMPTY_OBJ;

	if (props.multiple !== dom.multiple) {
		dom.multiple = props.multiple;
	}
	const children = vNode.children;

	if (!isInvalid(children)) {
		let value = props.value;
		if (mounting && isNullOrUndef(value)) {
			value = props.defaultValue;
		}
		if (isArray(children)) {
			for (let i = 0, len = children.length; i < len; i++) {
				updateChildOptionGroup(children[i], value);
			}
		} else if (isVNode(children)) {
			updateChildOptionGroup(children, value);
		}
	}
}
