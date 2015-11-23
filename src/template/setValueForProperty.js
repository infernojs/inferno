import DOMProperties            from './DOMProperties';
import shouldIgnoreValue        from './shouldIgnoreValue';
import deleteValueForProperty   from './deleteValueForProperty';
import isArray                  from '../util/isArray';


function setValueForProperty(node, name, value) {

       let propertyInfo = DOMProperties[name];

    if (propertyInfo !== undefined) {

        if (shouldIgnoreValue(propertyInfo, value)) {
            deleteValueForProperty(node, name);
            return;
        }

        if (propertyInfo.mustUseProperty) {

            let propName = propertyInfo.propertyName;

            if (propName === 'value' && (node.tagName.toLowerCase() === 'select')) {

                const multiple = isArray(value);
				const options = node.options;

                let selectedValue;
				let idx;
				let l;

                if (multiple) {

                    selectedValue = {};

                    for (idx = 0, l = value.length; idx < l; ++idx) {
                        selectedValue['' + value[idx]] = true;
                    }

                    for (idx = 0, l = options.length; idx < l; idx++) {
                        let selected = selectedValue[options[idx].value];

                        if (options[idx].selected !== selected) {
                            options[idx].selected = selected;
                        }
                    }

                } else {
                    // Do not set `select.value` as exact behavior isn't consistent across all
                    // browsers for all cases.
                    selectedValue = '' + value;

                    for (idx = 0, l = options.length; idx < l; idx++) {

                        if (options[idx].value === selectedValue) {
                            options[idx].selected = true;
                        }
                    }
                }
            } else if ('' + node[propName] !== '' + value) {
                node[propName] = value;
            }

            return;
        }

        let attributeName = propertyInfo.attributeName;
        let namespace = propertyInfo.attributeNamespace;

        if (namespace) {
            node.setAttributeNS(namespace, attributeName, '' + value);
        } else {
            node.setAttribute(attributeName, '' + value);
        }

    } else { // custom attributes


        // Take any attribute (with correct syntax) as custom attribute.
        if (name) {
            node.setAttribute(name, value);
        }

	}
}

export default setValueForProperty;