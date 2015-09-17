import minErr  			from '../util/minErr';
import isArray 			from '../util/isArray';
import createTemplate	from './createTemplate';

export default function createFragment(values, template) {
	if (template.key == null) {
		template = createTemplate(template);
	}

	let fragmentObject = {
		dom: null,
		key: null,
		next: null,
		template: template,
		templateTypes: null
	};

	if (values != null && (isArray(values))) {
		fragmentObject.templateElements = null;
		fragmentObject.templateValues = values;
	} else  {
		fragmentObject.templateElement = null;
		fragmentObject.templateValue = values;
	}

	return fragmentObject;
}
