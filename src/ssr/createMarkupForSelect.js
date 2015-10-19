import renderProperties            from './renderProperties';
import isArray                     from '../util/isArray';
import escapeTextContentForBrowser from './escapeTextContentForBrowser';
import findTheNeedle               from './findTheNeedle';

/**
 * Render HTML Markup server-side for select/select multiple
 * @param {String} tag
 * @param {Object} properties
 * @param {Array|null} optGroups
 * @param {Array} opt
 */
export default (tag, properties, optGroups, opt) => {

    // Pass down initial value so initial generated markup has correct
    // `selected` attributes
    let value = properties.value;

    if (value == null) {
        return '';
    }

    let props,
	    idx = 0,
        markup = '<select' + renderProperties(properties) + '>';

    // optgroups
    if (optGroups && (optGroups.length)) {

        for (idx = 0; idx < optGroups.length; idx++) {

            markup += '<optgroup';

            if (optGroups[idx].props != null) {
                markup += renderProperties(optGroups[idx].props);
            }

            markup += '><option';

            if (opt[idx] != null) {

                  props = opt[idx].props;

                if (props != null) {
                    markup += renderProperties(props);

                    // Look up whether this option is 'selected'
                    if (findTheNeedle(value, props.value)) {
                        markup += ' selected="selected"';
                    }

                }
                markup = markup + '>' + (opt[idx].children ? escapeTextContentForBrowser(opt[idx].children) : '') + '</option></optgroup>';
            }
        }

        return markup + '</select>';

        // option
    } else if (opt && (opt.length)) {

        for (idx = 0; idx < opt.length; idx++) {

            markup += '<option';

            if (opt[idx] != null) {

                 props = opt[idx].props;

                if (props != null) {
                    markup += renderProperties(props);


                    // Look up whether this option is 'selected'
                    if (findTheNeedle(value, props.value)) {
                        markup += ' selected="selected"';
                    }
                }
                markup = markup + '>' + (opt[idx].children ? escapeTextContentForBrowser(opt[idx].children) : '') + '</option>';
            }
        }
        return markup + '</select>';
    }

    // return blank for invalid markup. E.g. 'optGroup' without 'option' children etc.
    return '';
}