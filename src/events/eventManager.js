import SyntheticEvent from './SyntheticEvent';
import getDomNodeId from './getDomNodeId';
import EventRegistry from './EventRegistry';
import listenersStorage from './listenersStorage';
import globalEventListener from './globalEventListener';

import ExecutionEnvironment from '../util/ExecutionEnvironment';

const doc = global.document,
    body = doc && doc.body;

function eventListener(e) {
    listenersStorage[getDomNodeId(e.target)][e.type](SyntheticEvent(e.type, e));
}

function addListener(domNode, type, listener) {

    const isRegistered = EventRegistry[type];

    if (isRegistered) {

        if (!isRegistered.set) {

            if (isRegistered.setup) {

                isRegistered.setup();

            } else {

                if (isRegistered.bubbles) {
                    body.addEventListener(type, globalEventListener, false);
                }
            }

            isRegistered.set = true;
        }

        const domNodeId = getDomNodeId(domNode),
            listeners = listenersStorage[domNodeId] || (listenersStorage[domNodeId] = {});

        if (!listeners[type]) {

            if (isRegistered.bubbles) {

                ++isRegistered.listenersCounter

            } else {

                domNode.addEventListener(type, eventListener, false);
            }
        }

        listeners[type] = listener;
    }
}

function removeListener(domNode, type) {
    const domNodeId = getDomNodeId(domNode, true);

    if (domNodeId) {
        const listeners = listenersStorage[domNodeId];

        if (listeners && listeners[type]) {
            listeners[type] = null;

            const isRegistered = EventRegistry[type];

            if (isRegistered) {
                isRegistered.bubbles ?
                    --isRegistered.listenersCounter :
                    domNode.removeEventListener(type, eventListener);
            }
        }
    }
}

export default {
    addListener,
    removeListener
};