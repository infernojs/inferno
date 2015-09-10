import events from "../events/shared/events";
import clearEventListeners from "../events/clearEventListeners";
import addEventListener from "../events/addEventListener";
import DOMPropsCfg from "./DOMPropsCfg";

export default function( node, props, component ) {
    let propName, propVal;

    for ( propName in props ) {
        propVal = props[propName];
        if ( events[propName] != null ) {
            clearEventListeners( node, propName );
            addEventListener( node, propName, propVal );
        } else {
            DOMPropsCfg( propName ).set( node, propName, propVal );
        }
    }
};
