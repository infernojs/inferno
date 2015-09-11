import events              from "../events/shared/events";
import clearEventListeners from "../events/clearEventListeners";
import addEventListener    from "../events/addEventListener";
import DOMAttrCfg          from "./cfg/DOMAttrCfg";
import forIn               from "../../util/forIn";

/**
 * Set HTML attributes on the template
 * @param{ HTMLElement } node
 * @param{ Object } attrs 
 * @param{ String } component
 */
export default (node, attrs, component) => {
    forIn(attrs, (attrName, attrVal) => {
        // avoid 'null' values
        if (attrVal != null) {
            if (events[attrName] != null) {
                clearEventListeners(node, attrName);
                addEventListener(node, attrName, attrVal);
            } else {
                DOMAttrCfg(attrName).set(node, attrName, attrVal);
            }
        }
    });
};