import isEventSupported from './isEventSupported';
import getDomNodeId from './getDomNodeId';
import EventConstants from './EventConstants';
import focusEvents from './focusEvents';
import globalEventListener from './globalEventListener';
import ExecutionEnvironment from '../util/ExecutionEnvironment';

const doc = global.document,
    body = doc && doc.body;


const EventRegistry = {};


if(ExecutionEnvironment.canUseDOM) {
	
  let i = 0,
        type;

    while(i < EventConstants.nativeEvents.length) {
        type = EventConstants.nativeEvents[i++];
  
   EventRegistry[type] = {}
  
   EventRegistry[type].type = type;
   EventRegistry[type].bubbles = true; 
   EventRegistry[type].listenersCounter = 0;
   EventRegistry[type].set = false; 
   EventRegistry[type].setup = null;
 
   if (focusEvents[type]) {

         if (isEventSupported(focusEvents[type])) {

             EventRegistry[type].setup = function() {
                 const type = this.type;
                 body.addEventListener(
                     focusEvents[type],
                     e => {
                         globalEventListener(e, type);
                     });
             }
         } else {

             EventRegistry[type].setup = function() {
                 body.addEventListener(
                     this.type,
                     globalEventListener,
                     true);
             }
         }

     } 
  }
    i = 0;
    while(i < EventConstants.nonBubbleableEvents.length) {
        EventRegistry[EventConstants.nonBubbleableEvents[i++]] = {
            type : type,
            bubbles : false,
            set : false
        };
    }	
}

export default EventRegistry;