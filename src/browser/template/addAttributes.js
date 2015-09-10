import events from "../events/shared/events";
import clearEventListeners from "../events/clearEventListeners";
import addEventListener from "../events/addEventListener";
import DOMAttrCfg from "./DOMAttrCfg";

export default function( node, attrs, component ) {
    let attrName, attrVal;

    for ( attrName in attrs ) {
        attrVal = attrs[attrName];
        if ( events[attrName] != null ) {
            clearEventListeners( node, attrName );
            addEventListener( node, attrName, attrVal );
        } else {
            DOMAttrCfg( attrName ).set( node, attrName, attrVal );
        }
    }
};
