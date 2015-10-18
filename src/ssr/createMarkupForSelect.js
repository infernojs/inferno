import renderProperties            from './renderProperties';
import isArray                     from '../util/isArray';
import escapeTextContentForBrowser from './escapeTextContentForBrowser';

/**
 * Render HTML Markup server-side for select/select multiple
 * @param {String} tag
 * @param {Object} props
 * @param {Array|null} optGroups
 * @param {Array} opt
 */
export default (tag, props, optGroups, opt) => {

    // Pass down initial value so initial generated markup has correct
    // `selected` attributes
    let value = props && props.value;

    if (value == null) {
        return;
    }

    let idx = 0,
        values = {};

    // multiple
    if (isArray(value)) {
        for (idx = 0; idx < value.length; idx++) {
            values[value[idx]] = value[idx];
        }
    } else {
        values[value] = value;
    }

    let markup = '<select' + renderProperties(props) + '>';

    // optgroups
    if (optGroups.length) {

        for (idx = 0; idx < optGroups.length; idx++) {

            markup += '<optgroup' + renderProperties(optGroups[idx].props) + '><option' + renderProperties(opt[idx].props);

            // Look up whether this option is 'selected'
            if (values[opt[idx].props.value]) {
                markup += ' selected="selected"';
            }

            markup = markup + '>' + escapeTextContentForBrowser(opt[idx].children) + '</option></optgroup>';
        }

        // select / select multiple
    } else {

        for (idx = 0; idx < opt.length; idx++) {

            markup += '<option' + renderProperties(opt[idx].props);

            // Look up whether this option is 'selected'
            if (values[opt[idx].props.value]) {
                markup += ' selected="selected"';
            }

            markup = markup + '>' + escapeTextContentForBrowser(opt[idx].children) + '</option>';
        }
    }

    markup = markup + '</select>';

    return markup;
}