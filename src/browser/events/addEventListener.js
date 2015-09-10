import rootListeners from "./shared/rootListeners";
import events from "./shared/events";

export default ( parentDom, listenerName, callback ) => {

    rootListeners[events[listenerName]].push( {
        target: parentDom,
        callback: callback
    } );

};
