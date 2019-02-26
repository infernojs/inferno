import { isNull } from 'inferno-shared';
import { LinkedEvent, SemiSyntheticEvent } from './../../core/types';
import { normalizeEventName } from './../utils/common';

interface IEventData {
  dom: Element;
}

function getDelegatedEventObject(v) {
  return {
    onClick: v,
    onDblClick: v,
    onFocusIn: v,
    onFocusOut: v,
    onKeyDown: v,
    onKeyPress: v,
    onKeyUp: v,
    onMouseDown: v,
    onMouseMove: v,
    onMouseUp: v,
    onSubmit: v,
    onTouchEnd: v,
    onTouchMove: v,
    onTouchStart: v
  };
}

export function getDocumentId(doc: Document) {
  for (const docId in documentsScopes) {
    if (documentsScopes[docId] === doc) {
      return docId;
    }
  }

  return null;
}

let uniqueId: number = 1;

export function registerDocumentScope(doc: Document) {
  const docId = uniqueId++;
  documentsScopes[docId] = doc;
  attachedEventCounts[docId] = getDelegatedEventObject(0);
  attachedEvents[docId] = getDelegatedEventObject(null);
  return docId;
}

const documentsScopes = {};
const attachedEventCounts = {};
const attachedEvents = {};

export const delegatedEvents = getDelegatedEventObject(true);

export function handleEvent(name: string, nextEvent: Function | LinkedEvent<any, any> | null, dom, doc: Document) {
  let eventsObject = dom.$EV;
  const docId: string | null = getDocumentId(doc);

  if (docId !== null) {
    if (nextEvent) {
      if (attachedEventCounts[docId][name] === 0) {
        attachedEvents[docId][name] = attachEventToDocument(name, doc);
      }
      if (!eventsObject) {
        eventsObject = (dom as any).$EV = getDelegatedEventObject(null);
      }
      if (!eventsObject[name]) {
        ++attachedEventCounts[docId][name];
      }
      eventsObject[name] = nextEvent;
    } else if (eventsObject && eventsObject[name]) {
      if (--attachedEventCounts[docId][name] === 0) {
        doc.removeEventListener(normalizeEventName(name), attachedEvents[docId][name]);
        attachedEvents[docId][name] = null;
      }
      eventsObject[name] = null;
    }
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

function stopPropagation() {
  this.cancelBubble = true;
  if (!this.immediatePropagationStopped) {
    this.stopImmediatePropagation();
  }
}

function isDefaultPrevented() {
  return this.defaultPrevented;
}

function isPropagationStopped() {
  return this.cancelBubble;
}

function attachEventToDocument(name: string, doc: Document) {
  const docEvent = function(event: SemiSyntheticEvent<any>) {
    const isClick = name === 'onClick' || name === 'onDblClick';

    if (isClick && (event as any).button !== 0) {
      // Firefox incorrectly triggers click event for mid/right mouse buttons.
      // This bug has been active for 12 years.
      // https://bugzilla.mozilla.org/show_bug.cgi?id=184051
      event.stopPropagation();
      return;
    }

    event.isDefaultPrevented = isDefaultPrevented;
    event.isPropagationStopped = isPropagationStopped;
    event.stopPropagation = stopPropagation;
    // Event data needs to be object to save reference to currentTarget getter
    const eventData: IEventData = {
      dom: doc as any
    };

    Object.defineProperty(event, 'currentTarget', {
      configurable: true,
      get: function get() {
        return eventData.dom;
      }
    });

    dispatchEvents(event, event.target, isClick, name, eventData);
  };

  doc.addEventListener(normalizeEventName(name), docEvent);
  return docEvent;
}
