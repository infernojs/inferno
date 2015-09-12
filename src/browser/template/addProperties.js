import events              from "../events/shared/events";
import clearEventListeners from "../events/clearEventListeners";
import addEventListener    from "../events/addEventListener";
import DOMAttributes       from "./DOMAttributes";
import forIn               from "../../util/forIn";

/**
 * Set HTML properties on the template
 * @param{ HTMLElement } node
 * @param{ Object } props 
 */
export default (node, props) => {

    forIn(props, (propName, propVal) => {
        // avoid 'null' values
        if (propVal != null) {
            if (events[propName] != null) {
                clearEventListeners(node, propName);
                addEventListener(node, propName, propVal);
            } else {
                DOMAttributes(node, propName, propVal)
            }
        }
    });
};