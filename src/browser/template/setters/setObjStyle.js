import cleanValues from "../styles/cleanValues";
import forIn       from "../../../util/forIn";
import HOOK        from "../hooks/styleHook";

/**
 * Set CSS styles
 *
 * @param {Object} node
 * @param {String} propertyName
 * @param {String} value
 */
export default (node, propertyName, value) => {

    // FIX ME!! t7 has to be fixed so it handle object literal. Then 
    // we can remove this 'typeof' check
    if (typeof value === "string") {

        node.style.cssText = value;

    } else {

        forIn(value, (styleName, styleValue) => {

            let style = node[propertyName],
                setter = HOOK.set[styleName] || HOOK.find(styleName, style);

            if (value == null) {
				value = "";
			}

            if (typeof setter === "function") {
                setter(value, style);
            } else {
                style[setter] = typeof value === "number" ? value + "px" : value + ""; // cast to string
            }

        });
    }
};