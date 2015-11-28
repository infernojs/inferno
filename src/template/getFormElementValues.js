import getFormElementType from './getFormElementType';

export default function getFormElementValues(element) {

    const name = getFormElementType(element);

    switch (name) {
        case 'checkbox':
        case 'radio':
            if (!element.checked) {
                return false;
            }
            var val = element.getAttribute('value');
            return val == null ? true : val;
        case 'select':
        case 'select-multiple':
            var options = element.options;
            var values = [];
            for (var i = 0, len = options.length; i < len; i++) {
                if (options[i].selected) {
                    values.push(options[i].value);
                }
            }
            return name === 'select-multiple' ? values : values[0];
        default:
            return element.value;
    }
}