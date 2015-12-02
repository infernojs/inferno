import isArray from '../util/isArray';

// TODO!! Optimize!!
export default function setSelectValueForProperty(node, value) {

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
}