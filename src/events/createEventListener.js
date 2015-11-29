import setHandler from './setHandler';
import listenersStorage from './listenersStorage';
import InfernoNodeID from './InfernoNodeID';

export default function createEventListener(type) {
    return setHandler(type, e => listenersStorage[InfernoNodeID(e.target)][type](e));
}