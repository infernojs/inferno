import isArray 			from '../util/isArray';
import createTemplate	from './createTemplate';

export default function createFragment(values, template, key = null) {
	if (template.key == null) {
		template = createTemplate(template);
	}

	let fragmentObject = {
		dom: null,
		key: key,
		next: null,
		template: template,
		templateTypes: null
	};

	if (values != null && (isArray(values))) {
		fragmentObject.templateElements = new Array(values.length);
		fragmentObject.templateTypes = new Array(values.length);
		fragmentObject.templateValues = values;
	} else  {
		fragmentObject.templateElement = null;
		fragmentObject.templateValue = values;
	}

	return fragmentObject;
}
