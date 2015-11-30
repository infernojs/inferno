import listenersStorage from './listenersStorage';
import createListenerArguments from './createListenerArguments';
import InfernoNodeID from './InfernoNodeID';
import setupEvents from './setupEvents';

export default function createEventListener(type) {
    return e => {
        const event = setupEvents(e);
        const target = event.target;
        const listener = listenersStorage[InfernoNodeID(target)][type];
        const args = listener.originalHandler.length < 1
            ? [e]
            : createListenerArguments(target, e);

        listener.handler.apply(target, args);
    };
}