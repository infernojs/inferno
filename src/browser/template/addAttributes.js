import events              from "../events/shared/events";
import clearEventListeners from "../events/clearEventListeners";
import addEventListener    from "../events/addEventListener";
import HOOK                from "./hook";
import forIn               from "../../util/forIn";

/**
 * Set HTML attributes on the template
 * @param{ HTMLElement } node
 * @param{ Object } attrs 
 */
export default (node, attrs) => {
    forIn(attrs, (attrName, attrVal) => {
        // avoid 'null' values
        if (attrVal != null) {
            if (events[attrName] != null) {
                clearEventListeners(node, attrName);
                addEventListener(node, attrName, attrVal);
            } else {

                let ATTR = HOOK[attrName];

                if (ATTR) {
                    ATTR(node, attrName, attrVal);
				// custom attributes
                } else {
                    node.setAttribute(attrName, attrVal);
                }
            }
        }
    });
};