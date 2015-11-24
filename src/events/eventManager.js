import SyntheticEvent from './SyntheticEvent';
import getEventID from './getEventID';
import EventRegistry from './EventRegistry';
import listenersStorage from './listenersStorage';
import eventHandler from './eventHandler';

import ExecutionEnvironment from '../util/ExecutionEnvironment';

function eventListener(e) {
    listenersStorage[getEventID(e.target)][e.type](SyntheticEvent(e));
}

function addListener(domNode, type, listener) {

    const isRegistered = EventRegistry[type];

    if (isRegistered) {

        if (!isRegistered.isActive) {

            if (isRegistered.setup) {

                isRegistered.setup();

            } else {

                if (isRegistered.shouldBubble) {
                    document.addEventListener(type, eventHandler, false);
                }
            }

            isRegistered.isActive = true;
        }

        const domNodeId = getEventID(domNode),
            listeners = listenersStorage[domNodeId] || (listenersStorage[domNodeId] = {});

        if (!listeners[type]) {

            if (isRegistered.shouldBubble) {

                ++isRegistered.counter

            } else {

                domNode.addEventListener(type, eventListener, false);
            }
        }

        listeners[type] = listener;
    }
}

function removeListener(domNode, type) {
    const domNodeId = getEventID(domNode, true);

    if (domNodeId) {
        const listeners = listenersStorage[domNodeId];

        if (listeners && listeners[type]) {
            listeners[type] = null;

            const isRegistered = EventRegistry[type];

            if (isRegistered) {
                isRegistered.shouldBubble ?
                    --isRegistered.counter :
                    domNode.removeEventListener(type, eventListener);
            }
        }
    }
}

export default {
    addListener,
    removeListener
};