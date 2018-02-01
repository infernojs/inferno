import { isNull } from 'inferno-shared';

const attachedEventCounts = {};
const attachedEvents = {};

interface IEventData {
  dom: Element;
}

export function handleEvent(name: string, nextEvent: Function | null, dom) {
  const eventsLeft: number = attachedEventCounts[name];
  let eventsObject = dom.$EV;
  if (nextEvent) {
    if (!eventsLeft) {
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
    attachedEventCounts[name]--;
    if (eventsLeft === 1) {
      document.removeEventListener(normalizeEventName(name), attachedEvents[name]);
      attachedEvents[name] = null;
    }
    eventsObject[name] = nextEvent;
  }
}

function dispatchEvents(event, target, isClick: boolean, name: string, eventData: IEventData) {
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
  this.stopImmediatePropagation();
}

function attachEventToDocument(name: string) {
  const docEvent = (event: Event) => {
    event.stopPropagation = stopPropagation;
    // Event data needs to be object to save reference to currentTarget getter
    const eventData: IEventData = {
      dom: document as any
    };

    try {
      Object.defineProperty(event, 'currentTarget', {
        configurable: true,
        get: function get() {
          return eventData.dom;
        }
      });
    } catch (e) {
      /* safari7 and phantomJS will crash */
    }

    dispatchEvents(event, event.target, event.type === 'click', name, eventData);
  };
  document.addEventListener(normalizeEventName(name), docEvent);
  return docEvent;
}
