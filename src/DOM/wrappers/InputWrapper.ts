import {
	EMPTY_OBJ,
	isNullOrUndef
} from './../../shared';
import wrappers from './map';

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

	validateInputWrapper(vNode, dom, this);
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

	validateInputWrapper(vNode, dom, this);
	if (props.onClick) {
		props.onClick(e);
	} else if (props.onclick) {
		props.onclick(e);
	}
}

function handleAssociatedRadioInputs(name) {
	const inputs: any = document.querySelectorAll(`input[type="radio"][name="${ name }"]`);
	[].forEach.call(inputs,
		el => validateInputWrapper(null, el, null)
	);
}

export function attachInputWrapper(vNode, dom) {
	const props = vNode.props || EMPTY_OBJ;

	if (isControlled(props)) {
		const inputWrapper = {
			vNode
		};
		const type = props.type;

		if (isCheckedType(type)) {
			dom.onclick = onCheckboxChange.bind(inputWrapper);
			dom.onclick.wrapped = true;
		} else {
			dom.oninput = onTextInputChange.bind(inputWrapper);
			dom.oninput.wrapped = true;
		}
		wrappers.set(dom, inputWrapper);
		validateInputWrapper(vNode, dom, inputWrapper);
	}
}

export function validateInputWrapper(vNode, dom, inputWrapper) {
	let props = vNode && (vNode.props || EMPTY_OBJ);
	const associate = !!props;

	if (!vNode || isControlled(props)) {
		if (!inputWrapper) {
			inputWrapper = wrappers.get(dom);
		}
		if (!inputWrapper && vNode) {
			attachInputWrapper(vNode, dom);
			return;
		} else if (!vNode) {
			if (inputWrapper) {
				vNode = inputWrapper.vNode;
				props = vNode.props;
			} else {
				return;
			}
		}
		const type = props.type;

		inputWrapper.vNode = vNode;
		if (isCheckedType(type)) {
			dom.checked = vNode.props.checked;
			if (associate && props.type === 'radio' && props.name) {
				handleAssociatedRadioInputs(props.name);
			}
		} else {
			dom.value = vNode.props.value;
		}
	}
}
