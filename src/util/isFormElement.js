function isFormElement(tagName) {
	return tagName === 'form'
		|| tagName === 'input'
		|| tagName === 'textarea'
		|| tagName === 'label'
		|| tagName === 'fieldset'
		|| tagName === 'legend'
		|| tagName === 'select'
		|| tagName === 'optgroup'
		|| tagName === 'option'
		|| tagName === 'button'
		|| tagName === 'datalist'
		|| tagName === 'keygen'
		|| tagName === 'output';
}

export default isFormElement;