import rootlisteners from "./shared/rootlisteners";
import events from "./shared/events";

export default ( parentDom, component, listenerName, callback ) => {
	
    rootlisteners[events[listenerName]].push( {
        target: parentDom,
        callback: callback,
        component: component
    } );

};
