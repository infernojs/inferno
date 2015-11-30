import listenersStorage from './listenersStorage';
import InfernoNodeID from './InfernoNodeID';

export default function createEventListener(type) {
    return e => {
        let listeners = listenersStorage[InfernoNodeID(e.target)]
        let listener = listeners[type]
        listener.handler(e);
    };
}