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

	dom.value = props.value;
	if (props.onInput) {
		props.onInput(e);
	} else if (props.oninput) {
		props.oninput(e);
	}
}

export function attachInputWrapper(vNode, dom) {
	const props = vNode.props || EMPTY_OBJ;

	if (isControlled(props)) {
		const inputWrapper = {
			vNode
		};
		const type = props.type;

		if (isCheckedType(type)) {
		} else {
			dom.oninput = onTextInputChange.bind(inputWrapper);
			dom.oninput.wrapped = true;
		}
		wrappers.set(dom, inputWrapper);
		validateInputWrapper(vNode, dom, inputWrapper);
	}
}

export function validateInputWrapper(vNode, dom, inputWrapper) {
	const props = vNode.props || EMPTY_OBJ;

	if (isControlled(props)) {
		if (!inputWrapper) {
			inputWrapper = wrappers.get(dom);
		}
		if (!inputWrapper) {
			attachInputWrapper(vNode, dom);
			return;
		}
		inputWrapper.vNode = vNode;
	}
}
