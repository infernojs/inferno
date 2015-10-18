import renderProperties            from './renderProperties';
import isArray                     from '../util/isArray';
import escapeTextContentForBrowser from './escapeTextContentForBrowser';
import findTheNeedle               from './findTheNeedle';

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
    let value = props.value;

    if (value == null) {
        return '';
    }

    let idx = 0,
	     markup = '<select' + renderProperties(props) + '>';

    // optgroups
    if (optGroups.length) {

        for (idx = 0; idx < optGroups.length; idx++) {

            markup += '<optgroup';

            if (optGroups[idx].props != null) {
                markup += renderProperties(optGroups[idx].props);
            }

            markup += '><option';

            if (opt[idx].props != null) {
                markup += renderProperties(opt[idx].props);
            }

            // Look up whether this option is 'selected'
            if (findTheNeedle(value, opt[idx].props.value)) {
                markup += ' selected="selected"';
            }

            markup = markup + '>' + escapeTextContentForBrowser(opt[idx].children) + '</option></optgroup>';
        }

        // option
    } else {

        for (idx = 0; idx < opt.length; idx++) {

            markup += '<option';

            if (opt[idx].props != null) {
                markup += renderProperties(opt[idx].props);
            }

            // Look up whether this option is 'selected'
            if (findTheNeedle(value, opt[idx].props.value)) {
                markup += ' selected="selected"';
            }

            markup = markup + '>' + escapeTextContentForBrowser(opt[idx].children) + '</option>';
        }
    }

   return markup + '</select>';
}