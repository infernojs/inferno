import isArray 			from '../util/isArray';
import createTemplate	from './createTemplate';

export default function createFragment(values, template, key = null) {
	if (template.key == null) {
		template = createTemplate(template);
	}



	let fragment = {
		dom: null,
		key: key,
		next: null,
		template: template
	};

	 if (values != null) {
        if (isArray(values)) {
			
            if (values.length === 1) {
                fragment.templateElement = null;
                fragment.templateType = null;
                fragment.templateValue = values[0];
                fragment.templateComponent = null;
            } else if ( values.length > 1 ) {
                fragment.templateElements = new Array(values.length);
                fragment.templateTypes = new Array(values.length);
                fragment.templateComponents = new Array(values.length);
                fragment.templateValues = values;
            }
        } else {
            fragment.templateElement = null;
            fragment.templateType = null;
            fragment.templateValue = values;
        }
    }

    return fragment;
}
