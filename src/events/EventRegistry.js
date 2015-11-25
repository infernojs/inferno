import isEventSupported from './isEventSupported';
import capturableEvents from './capturableEvents';
import nonBubbleableEvents from './nonBubbleableEvents';
import focusEvents from './focusEvents';
import ExecutionEnvironment from '../util/ExecutionEnvironment';
import addRootDomEventListerners from './addRootDomEventListerners';

let EventRegistry = {};

if(ExecutionEnvironment.canUseDOM) {

    let i = 0,
        type;

  for (; i < capturableEvents.length; i++) {

        type = capturableEvents[i];

        EventRegistry[type] = {
            type : type,
            bubbles : true,
            listenersCounter : 0,
            set : false,
            setup : focusEvents[type] ?

                isEventSupported(focusEvents[type]) ?
                    function() {
                        const type = this.type;
                        document.addEventListener(focusEvents[type], e => { addRootDomEventListerners(e, type); });
                    } :
                    function() {
                        document.addEventListener(this.type, addRootDomEventListerners, true);
                    } :
                null
        };
    }
    
	for (i = 0; i < nonBubbleableEvents.length; i++) {
        EventRegistry[nonBubbleableEvents[i]] = {
            type : type,
            bubbles : false,
            set : false
        };
    }
}

export default EventRegistry;