import minErr  from '../../util/minErr';
import isArray from '../../util/isArray';

export default function createFragment(values, template) {
	if (template.key === undefined) {
		minErr('createFragment()', 'Template is missing a key');
	}

	let fragmentObject = {
		dom: null,
		key: null,
		next: null,
		template: template,
		templateTypes: null
	};
	/**
	 * To 'failsafe' this and avoid throwing on non-constructor, we have to check
	 * if the 'values' are 'null'.
	 */
	if (values != null && (isArray(values))) {
		fragmentObject.templateElements = null;
		fragmentObject.templateValues = values;
	} else {
		fragmentObject.templateElement = null;
		fragmentObject.templateValue = values;
	}

	return fragmentObject;
}
