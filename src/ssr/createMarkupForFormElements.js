import createMarkupForSelect from './createMarkupForSelect';

let optGroups = [],
    opts = [];

export default (tag, props, children) => {

    // Special case - optgroup should not be rendered before the 'select' element
    if (tag === 'optgroup') {

        optGroups.push({
            tag,
            props
        });

        return;
    }

    // Special case - option should not be rendered before the 'select' element
    if (tag === 'option') {

        opts.push({
            tag,
            props,
            children
        });

        return;
    }

    // Special case - select values (should not be stringified)
    if (tag === 'select') {

        let ret = createMarkupForSelect(tag, props, optGroups, opts);

        // Always remove the contents of 'optGroups' and 'opts' array
        optGroups = [];
        opts = [];

        // Return the markup
        return ret;
    }
}