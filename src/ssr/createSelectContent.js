import renderProperties            from './renderProperties';
import escapeTextContentForBrowser from './escapeTextContentForBrowser';
import isArray                     from '../util/isArray';

export default (markup, props, value, opt, pos) => {

    if (props != null) {

        markup += renderProperties(props);

        let selectedValue = props.value;

        // multiple
        if (typeof value === 'object') {
            if (isArray(value)) {
                for (let idx = 0; idx < value.length; idx++) {
                    if (value[idx] === selectedValue) {
                        markup += ' selected="selected"';
                    }
                }
            }

        } else {
            if (value === selectedValue) {
                markup += ' selected="selected"';
            }
        }
    }
    return markup + '>' + (opt[pos].children ? escapeTextContentForBrowser(opt[pos].children) : '');
}