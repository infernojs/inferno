import forIn from "../../util/forIn";
import cleanValues from "./cleanValues";
import hyphenateStyleName from "./hyphenateStyleName";

export default {

    /**
     * Create SSR HTML markup for CSS styles
     * @param {Object} styles
     * @return { string}
     */
    renderStyleToString(styles) {

            let idx = 0,
                len, html = "";

            forIn(styles, (styleName, styleValue) => {

                if (styleValue != null) {

                    html += hyphenateStyleName(styleName) + ":" + cleanValues(styleName, styleValue) + ";";
                }
            });

            return html;
        },

        /**
         * Set CSS styles
         *
         * @param {Object} node
         * @param {String} propertyName
         * @param {String} value
         */

        setStyles(node, propertyName, value) {

            let idx = 0,
                len, style = node[propertyName];

            forIn(value, (styleName, styleValue) => {

                if (styleValue != null) {

                    style[styleName] = cleanValues(styleName, styleValue);

                } else {

                    style[styleName] = "";
                }
            });
        }
};