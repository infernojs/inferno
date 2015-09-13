import events              from "../events/shared/events";
import clearEventListeners from "../events/clearEventListeners";
import addEventListener    from "../events/addEventListener";
import { htmlStyles }      from "./CSSOperations";
import { DOMOperations }   from "./DOMOperations";
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
			} else if (attrName === "style") {
               htmlStyles(node, attrName, attrVal);
            } else {
               DOMOperations(node, attrName, attrVal);
            }
        }
    });
};