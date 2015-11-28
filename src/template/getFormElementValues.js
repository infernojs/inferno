import getFormElementType from './getFormElementType';

function selectValues( elem ) {
    let value,
        option,
        options = elem.options,
        index = elem.selectedIndex,
        one = elem.type === 'select-one',
        values = one ? null : [],
        max = one ? index + 1 : options.length,
        i = index < 0
            ? max
            : one ? index : 0;

    // Loop through all the selected options
    for ( ; i < max; i++ ) {
        option = options[ i ];

        // IMPORTANT! IE9 doesn't update selected after form reset
        if ( ( option.selected || i === index )

            // Don't return options that are disabled or in a disabled optgroup
            && !option.disabled
            && ( !option.parentNode.disabled ||
                option.parentNode.nodeName !== 'OPTGROUP' ) ) {

            // Get the specific value for the option
            value = option.value;

            // We don't need an array for one selects
            if ( one ) {
                return value;
            }

            // Multi-Selects return an array
            values.push( value );
        }
    }

    return values;
}

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
            return selectValues(node);
        default:
            return node.value;
    }
}