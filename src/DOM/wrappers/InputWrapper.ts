import {
	EMPTY_OBJ,
	isNullOrUndef
} from '../../shared';
import { wrappers } from './processElement';

function isCheckedType(type) {
	return type === 'checkbox' || type === 'radio';
}

function isControlled(props) {
	const usesChecked = isCheckedType(props.type);

	return usesChecked ? !isNullOrUndef(props.checked) : !isNullOrUndef(props.value);
}

function onTextInputChange(e) {
	let vNode = this.vNode;
	const events = vNode.events || EMPTY_OBJ;
	const dom = vNode.dom;

	if (events.onInput) {
		events.onInput(e);
	} else if (events.oninput) {
		events.oninput(e);
	}
	// the user may have updated the vNode from the above onInput events
	// so we need to get it from the context of `this` again
	applyValue(this.vNode, dom);
}

function onCheckboxChange(e) {
	const vNode = this.vNode;
	const events = vNode.events || EMPTY_OBJ;
	const dom = vNode.dom;

	if (events.onClick) {
		events.onClick(e);
	} else if (events.onclick) {
		events.onclick(e);
	}
	// the user may have updated the vNode from the above onClick events
	// so we need to get it from the context of `this` again
	applyValue(this.vNode, dom);
}

function handleAssociatedRadioInputs(name) {
	const inputs: any = document.querySelectorAll(`input[type="radio"][name="${ name }"]`);
	[].forEach.call(inputs, dom => {
		const inputWrapper = wrappers.get(dom);

		if (inputWrapper) {
			const props = inputWrapper.vNode.props;

			if (props) {
				dom.checked = inputWrapper.vNode.props.checked;
			}
		}
	});
}

export function processInput(vNode, dom) {
	const props = vNode.props || EMPTY_OBJ;

	applyValue(vNode, dom);
	if (isControlled(props)) {
		let inputWrapper = wrappers.get(dom);

		if (!inputWrapper) {
			inputWrapper = {
				vNode
			};

			if (isCheckedType(props.type)) {
				dom.onclick = onCheckboxChange.bind(inputWrapper);
				dom.onclick.wrapped = true;
			} else {
				dom.oninput = onTextInputChange.bind(inputWrapper);
				dom.oninput.wrapped = true;
			}
			wrappers.set(dom, inputWrapper);
		}
		inputWrapper.vNode = vNode;
	}
}

export function applyValue(vNode, dom) {
	const props = vNode.props || EMPTY_OBJ;
	const type = props.type;
	const value = props.value;
	const checked = props.checked;

	if (type !== dom.type && type) {
		dom.type = type;
	}
	if (props.multiple !== dom.multiple) {
		dom.multiple = props.multiple;
	}
	if (isCheckedType(type)) {
		if (!isNullOrUndef(value)) {
			dom.value = value;
		}
		dom.checked = checked;
		if (type === 'radio' && props.name) {
			handleAssociatedRadioInputs(props.name);
		}
	} else {
		if (!isNullOrUndef(value) && dom.value !== value) {
			dom.value = value;
		} else if (!isNullOrUndef(checked)) {
			dom.checked = checked;
		}
	}
}
