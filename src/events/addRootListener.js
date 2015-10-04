import rootListeners from './shared/rootListeners';
import capturable from './shared/capturable';
import evtList from './shared/evtList';

export default function addRootListener() {

    for (let i = 0; i < evtList.length; i++) {

        let event = evtList[i];

        document.addEventListener(event, (e) => {
            for (let ii = 0; ii < rootListeners[event].length; ii++) {
                if (rootListeners[event][ii].target === e.target) {
                    rootListeners[event][ii].callback(e);
                }
            }
        }, capturable[name] !== undefined);
    }
}