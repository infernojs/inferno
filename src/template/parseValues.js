import isArray from '../util/isArray';
import inArray from '../util/inArray';

export default (node, value) => {

    const multiple = isArray(value),
        options = node.options;

    if (multiple && (typeof value[0] === 'number')) {
        let selectedValue = {};
        for (i = 0; i < value.length; i++) {
            selectedValue['' + value[i]] = true;
        }

        for (i = 0; i < options.length; i++) {
            let selected = selectedValue.hasOwnProperty(options[i].value);
            if (options[i].selected !== selected) {
                options[i].selected = true;
            }
        }
    } else {
        let optionNode;
        for (let i = 0; i < options.length; i++) {
            optionNode = options[i];
            optionNode.selected = value != null && (multiple ? inArray(value, optionNode.value) : optionNode.value == value);
        }
    }

};