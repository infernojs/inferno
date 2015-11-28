import getFormElementType from './getFormElementType';

export default function getFormElementValues(node) {

    const name = getFormElementType(node);

    switch (name) {
        case 'checkbox':
        case 'radio':
            if (!node.checked) {
                return false;
            }
            const val = node.getAttribute('value');
            return val == null ? true : val;
        case 'select':
        case 'select-multiple':
            const options = node.options;
            let values = [];
            for (let i = 0, len = options.length; i < len; i++) {
                if (options[i].selected) {
                    values.push(options[i].value);
                }
            }
            return name === 'select-multiple' ? values : values[0];
        default:
            return node.value;
    }
}