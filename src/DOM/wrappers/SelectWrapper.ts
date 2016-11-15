import {
	isArray,
	EMPTY_OBJ,
	isNullOrUndef
} from './../../shared';
import { wrappers } from './processElement';
import { isVNode } from '../../core/shapes';

function isControlled(props) {
	return !isNullOrUndef(props.value);
}

function updateChildOption(vNode, value) {
	const props = vNode.props || EMPTY_OBJ;
	const dom = vNode.dom;

	// we do this as multiple may have changed
	dom.value = props.value;
	if ((isArray(value) && value.indexOf(props.value) !== -1) || props.value === value) {
		dom.selected = true;
	} else {
		dom.selected = props.selected || false;
	}
}

function onSelectChange(e) {
	const vNode = this.vNode;
	const props = vNode.props;
	const dom = vNode.dom;

	if (props.onChange) {
		props.onChange(e);
	} else if (props.onchange) {
		props.onchange(e);
	}
	applyValue(vNode, dom);
}

export function processSelect(vNode, dom) {
	const props = vNode.props || EMPTY_OBJ;

	applyValue(vNode, dom);
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
	}
}

export function applyValue(vNode, dom) {
	const props = vNode.props || EMPTY_OBJ;

	if (props.multiple !== dom.multiple) {
		dom.multiple = props.multiple;
	}
	const children = vNode.children;
	const value = props.value;

	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			updateChildOption(children[i], value);
		}
	} else if (isVNode(children)) {
		updateChildOption(children, value);
	}
}
