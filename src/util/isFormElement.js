function isFormElement( nodeName ) {
	return nodeName === 'form'
		|| nodeName === 'input'
		|| nodeName === 'textarea'
		|| nodeName === 'label'
		|| nodeName === 'fieldset'
		|| nodeName === 'legend'
		|| nodeName === 'select'
		|| nodeName === 'optgroup'
		|| nodeName === 'option'
		|| nodeName === 'button'
		|| nodeName === 'datalist'
		|| nodeName === 'keygen'
		|| nodeName === 'output';
}

export default isFormElement;