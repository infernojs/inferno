import normalizeCSS from '../template/normalizeCSS';
import dasherize    from '../template/dasherize';

/**
 * Serializes a mapping of style properties for use as inline styles:
 *
 *   > createMarkupForStyles({width: '200px', height: 0})
 *   "width:200px;height:0;"
 *
 * Undefined values are ignored so that declarative programming is easier.
 * The result should be HTML-escaped before insertion into the DOM.
 *
 * @param {object} styles
 * @return {?string}
 */

export default (styles) => {
    let serialized = '';
    for (let styleName in styles) {
        if (styles[styleName] != null) {
            serialized += dasherize(styleName) + ':' + normalizeCSS(styleName, styles[styleName]) + ';';
        }
    }
    return serialized || null;
};