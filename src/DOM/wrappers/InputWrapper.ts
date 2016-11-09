import {
	EMPTY_OBJ,
	isNullOrUndef
} from './../../shared';
import { wrappers } from './processElement';

function isCheckedType(type) {
	return type === 'checkbox' || type === 'radio';
}

function isControlled(props) {
	const usesChecked = isCheckedType(props.type);

	return usesChecked ? !isNullOrUndef(props.checked) : !isNullOrUndef(props.value);
}

function onTextInputChange(e) {
	const vNode = this.vNode;
	const props = vNode.props;
	const dom = vNode.dom;

	applyValue(vNode, dom, false);
	if (props.onInput) {
		props.onInput(e);
	} else if (props.oninput) {
		props.oninput(e);
	}
}

function onCheckboxChange(e) {
	const vNode = this.vNode;
	const props = vNode.props;
	const dom = vNode.dom;

	applyValue(vNode, dom, false);
	if (props.onClick) {
		props.onClick(e);
	} else if (props.onclick) {
		props.onclick(e);
	}
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

	applyValue(vNode, dom, true);
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

export function applyValue(vNode, dom, force) {
	const props = vNode.props || EMPTY_OBJ;
	const type = props.type;

	if ((force || type !== dom.type) && type) {
		dom.type = type;
	}
	if (isCheckedType(type)) {
		dom.checked = props.checked;
		if (type === 'radio' && props.name) {
			handleAssociatedRadioInputs(props.name);
		}
	} else {
		const value = props.value;

		if (!isNullOrUndef(value) && (force || dom.value !== value)) {
			dom.value = value;
		} else if (!isNullOrUndef(props.checked)) {
			dom.checked = props.checked;
		}
	}
}
