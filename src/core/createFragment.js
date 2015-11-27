import isArray from '../util/isArray';
import createTemplate from './createTemplate';

export default function createFragment(values, template, key = null) {
    if (template.key == null) {
        template = createTemplate(template);
    }

    let fragmentObject = {
        dom: null,
        key: key,
        next: null,
        template: template
    };

    if (values) {
        if (isArray(values)) {
            if (values.length === 1) {
                fragmentObject.templateElement = null;
                fragmentObject.templateType = null;
                fragmentObject.templateValue = values[0];
                fragmentObject.templateComponent = null;
            } else {
                fragmentObject.templateElements = new Array(values.length);
                fragmentObject.templateTypes = new Array(values.length);
                fragmentObject.templateComponents = new Array(values.length);
                fragmentObject.templateValues = values;
            }
        } else {
            fragmentObject.templateElement = null;
            fragmentObject.templateType = null;
            fragmentObject.templateValue = values;
        }
    }
    return fragmentObject;
}