import createMarkupForProperty     from './createMarkupForProperty';
import createMarkupForStyles       from './createMarkupForStyles';

/**
 * Creates markup for the open tag and all attributes.
 *
 * @private
 * @param {String} tag
 * @param {Object} props
 * @param {String|Array} children
 * @return {string} Markup of opening tag.
 */
export default (tag, props, children) => {

    let ret = '<' + tag;

    for (let propKey in props) {

        let propValue = props[propKey];

        if (propValue == null) {
            continue;
        }
        // innerHTML, value and textarea are all special cases, and it's value shouldn't be rendered
        if (propKey === 'innerHTML' || (propKey === 'value' && (tag === 'textarea'))) {
            continue;
        }

        if (propKey === 'style') {
            ret += `${' ' + propKey}="${createMarkupForStyles(propValue)}"`;
        } else {

            let markup = createMarkupForProperty(propKey, propValue);

            if (markup) {
                ret += ' ' + markup;
            }
        }
    }

    return ret;
};