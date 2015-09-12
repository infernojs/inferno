import rootListeners from "./shared/rootListeners";
import events from "./shared/events";

export default function addEventListener( parentDom, listenerName, callback ) {
    rootListeners[events[listenerName]].push( {
        target: parentDom,
        callback: callback
    } );
};
