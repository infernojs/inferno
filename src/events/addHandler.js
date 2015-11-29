import setupEventListener from './setupEventListener';
import listenersStorage from './listenersStorage';
import InfernoNodeID from './InfernoNodeID';

export default function createEventListener(type) {
    return setupEventListener(type, e => listenersStorage[InfernoNodeID(e.target)][type](e));
}