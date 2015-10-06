import capturedEvents   from '../shared/capturedEvents';
import noCaptureEvents  from '../shared/noCaptureEvents';
import focusEvents      from '../shared/focusEvents';
import addEventListener from '../addEventListener';
import root             from '../root';
import isEventSupported from '../isEventSupported';

let eventsCfg = {};

// This will not work on server side
if (document.body) {

    let i = 0,
        type;

    while (i < capturedEvents.length) {
        type = capturedEvents[i++];
        eventsCfg[type] = {
            type: type,
            bubbles: true,
            countListeners: 0,
            set: false,
			// firefox doesn't support focusin/focusout events
            setup: focusEvents && (focusEvents[type] && (isEventSupported(focusEvents[type]))) ?
                function() {
                    const type = this.type;
                    addEventListener(
                        document.body,
                        focusEvents[type],
                        e => {
                            addEventListener(e, type);
                        });
                } :
                function() {
                    addEventListener(
                        document.body,
                        this.type ,
                        root.addRootListener,
                        true);
                }
        };
    }
    i = 0;
    while (i < noCaptureEvents.length) {
        eventsCfg[noCaptureEvents[i++]] = {
            type: type,
            bubbles: false,
            set: false
        };
    }
}

export default eventsCfg;