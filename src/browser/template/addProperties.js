import events              from "../events/shared/events";
import clearEventListeners from "../events/clearEventListeners";
import addEventListener    from "../events/addEventListener";
import DOMPropsCfg         from "./cfg/DOMPropsCfg";
import forIn               from "../../util/forIn";

/**
 * Set HTML properties on the template
 * @param{ HTMLElement } node
 * @param{ Object } props 
 * @param{ String } component
 */
export default (node, props, component) => {

    forIn(props, (propName, propVal) => {
        // avoid 'null' values
        if (propVal != null) {
            if (events[propName] != null) {
                clearEventListeners(node, propName);
                addEventListener(node, propName, propVal);
            } else {
                DOMPropsCfg(propName).add(node, propName, propVal);
            }
        }
    });
};