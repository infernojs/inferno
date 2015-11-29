import getFormElementType from './getFormElementType';

function selectValues(node) {

    if (node.multiple) {

        let result = [];
        let index = node.selectedIndex;
        let option;
        let options = node.options;
        let i = index < 0 ? options.length : 0;

        for (; i < options.length; i++) {

            option = options[i];
            // IMPORTANT! IE9 doesn't update selected after form reset
            if ((option.selected || i === index) &&

                // Don't return options that are disabled or in a disabled optgroup
                !option.disabled && (!option.parentNode.disabled || option.parentNode.nodeName !== 'OPTGROUP')) {
                result.push(option.value || option.text);
            }
        }
        return result.length === 0 ? null : result;
    }

    return node.value;
}

export default function getFormElementValues(node) {

    const name = getFormElementType(node);

    switch (name) {
        case 'checkbox':
        case 'radio':
            if (node.checked) {
                return true;
            }
            return false;
        case 'select':
        case 'select-multiple':
            return selectValues(node);
        default:
            return node.value;
    }
}