import listenersStorage from './listenersStorage';
import createListenerArguments from './createListenerArguments';
import InfernoNodeID from './InfernoNodeID';

export default function createEventListener(type) {
    return e => {
        const target = e.target;
        const listener = listenersStorage[InfernoNodeID(target)][type];
        const args = listener.originalHandler.length < 1
            ? [e]
            : createListenerArguments(target, e);

        listener.handler.apply(target, args);
    };
}