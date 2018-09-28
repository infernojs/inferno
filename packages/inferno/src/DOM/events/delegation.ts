import { SemiSyntheticEvent } from './../../core/types';
import { isNull } from 'inferno-shared';

const attachedEventCounts = {};
const attachedEvents = {};

interface IEventData {
  dom: Element;
}

export function handleEvent(name: string, nextEvent: Function | null, dom) {
  let eventsObject = dom.$EV;
  if (nextEvent) {
    if (!attachedEventCounts[name]) {
      attachedEvents[name] = attachEventToDocument(name);
      attachedEventCounts[name] = 0;
    }
    if (!eventsObject) {
      eventsObject = (dom as any).$EV = {};
    }
    if (!eventsObject[name]) {
      attachedEventCounts[name]++;
    }
    eventsObject[name] = nextEvent;
  } else if (eventsObject && eventsObject[name]) {
    if (--attachedEventCounts[name] === 0) {
      document.removeEventListener(normalizeEventName(name), attachedEvents[name]);
      attachedEvents[name] = null;
    }
    eventsObject[name] = nextEvent;
  }
}

function dispatchEvents(event: SemiSyntheticEvent<any>, target, isClick: boolean, name: string, eventData: IEventData) {
  let dom = target;
  while (!isNull(dom)) {
    // Html Nodes can be nested fe: span inside button in that scenario browser does not handle disabled attribute on parent,
    // because the event listener is on document.body
    // Don't process clicks on disabled elements
    if (isClick && dom.disabled) {
      return;
    }
    const eventsObject = dom.$EV;

    if (eventsObject) {
      const currentEvent = eventsObject[name];

      if (currentEvent) {
        // linkEvent object
        eventData.dom = dom;
        if (currentEvent.event) {
          currentEvent.event(currentEvent.data, event);
        } else {
          currentEvent(event);
        }
        if (event.cancelBubble) {
          return;
        }
      }
    }
    dom = dom.parentNode;
  }
}

function normalizeEventName(name) {
  return name.substr(2).toLowerCase();
}

function stopPropagation() {
  this.cancelBubble = true;
  if (!this.immediatePropagationStopped) {
    this.stopImmediatePropagation();
  }
}

function attachEventToDocument(name: string) {
  const docEvent = function(event: Event) {
    const isClick = name === 'onClick' || name === 'onDblClick';

    if (isClick && (event as MouseEvent).button !== 0) {
      // Firefox incorrectly triggers click event for mid/right mouse buttons.
      // This bug has been active for 12 years.
      // https://bugzilla.mozilla.org/show_bug.cgi?id=184051
      event.stopPropagation();
      return;
    }

    event.stopPropagation = stopPropagation;
    // Event data needs to be object to save reference to currentTarget getter
    const eventData: IEventData = {
      dom: document as any
    };

    Object.defineProperty(event, 'currentTarget', {
      configurable: true,
      get: function get() {
        return eventData.dom;
      }
    });

    dispatchEvents(event, event.target, isClick, name, eventData);
  };
  document.addEventListener(normalizeEventName(name), docEvent);
  return docEvent;
}
