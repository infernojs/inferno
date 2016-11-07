import {
	EMPTY_OBJ,
	isNullOrUndef
} from './../../shared';

const inputWrappers = new WeakMap();

function isControlled(props) {
	const type = props.type;
	const usesChecked = type === 'checkbox' || type === 'radio';

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
			vNode,
			onChange: null
		};
		const type = props.type;

		if (type === 'text' || '') {
			inputWrapper.onChange = onTextInputChange.bind(inputWrapper);
			dom.oninput = inputWrapper.onChange;
		}
		inputWrappers.set(dom, inputWrapper);
		validateInputWrapper(vNode, dom, inputWrapper);
	}
}

export function validateInputWrapper(vNode, dom, inputWrapper) {
	if (!inputWrapper) {
		inputWrapper = inputWrappers.get(dom);
	}
	if (!inputWrapper) {
		attachInputWrapper(vNode, dom);
		return;
	}
	inputWrapper.vNode = vNode;
}
