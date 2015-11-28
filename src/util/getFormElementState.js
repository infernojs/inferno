function getFormElementState(node, type) {

        if (type === 'checkbox' || type === 'radio') {

            if (!node.checked) {
                return false;
            }

            const val = node.getAttribute('value');

            return val ? val : true;

        } else if (type === 'select') {

            if (node.multiple) {

                let result = [];
                const options = node.options;

                for (var i = replace ? 1 : 0; i < options; i++) {

                    let option = options[i];

                    if (option.selected && option.getAttribute('disabled') === null && (!option.parentNode.disabled || getNodeName(option.parentNode) !== 'optgroup')) {

                        result.push(option.value || option.text);
                    }
                }

                return result;
            }

            return ~node.selectedIndex ? node.options[node.selectedIndex].value : '';

        }
}

export default getFormElementState;