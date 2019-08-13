import {isFunction, isNull} from 'inferno-shared';
import {LinkedEvent, SemiSyntheticEvent} from './../../core/types';
import {isLastValueSameLinkEvent, normalizeEventName} from './../utils/common';
import {isLinkEventObject} from './linkEvent';

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
    onTouchEnd: v,
    onTouchMove: v,
    onTouchStart: v
  };
}
const attachedEventCounts = getDelegatedEventObject(0);
const attachedEvents = getDelegatedEventObject(null);

export const syntheticEvents = getDelegatedEventObject(true);

function updateOrAddSyntheticEvent(name: string, dom) {
  let eventsObject = dom.$EV;

  if (!eventsObject) {
    eventsObject = (dom as any).$EV = getDelegatedEventObject(null);
  }
  if (!eventsObject[name]) {
    if (++attachedEventCounts[name] === 1) {
      attachedEvents[name] = attachEventToDocument(name);
    }
  }

  return eventsObject;
}

export function unmountSyntheticEvent(name: string, dom) {
  const eventsObject = dom.$EV;

  if (eventsObject && eventsObject[name]) {
    if (--attachedEventCounts[name] === 0) {
      document.removeEventListener(normalizeEventName(name), attachedEvents[name]);
      attachedEvents[name] = null;
    }
    eventsObject[name] = null;
  }
}

export function handleSyntheticEvent(
  name: string,
  lastEvent: Function | LinkedEvent<any, any> | null | false | true,
  nextEvent: Function | LinkedEvent<any, any> | null | false | true,
  dom
) {
  if (isFunction(nextEvent)) {
    updateOrAddSyntheticEvent(name, dom)[name] = nextEvent;
  } else if (isLinkEventObject(nextEvent)) {
    if (isLastValueSameLinkEvent(lastEvent, nextEvent)) {
      return;
    }
    updateOrAddSyntheticEvent(name, dom)[name] = nextEvent;
  } else {
    unmountSyntheticEvent(name, dom);
  }
}

// When browsers fully support event.composedPath we could loop it through instead of using parentNode property
function getTargetNode(event) {
  return isFunction(event.composedPath) ? event.composedPath()[0] : event.target;
}

function dispatchEvents(event: SemiSyntheticEvent<any>, isClick: boolean, name: string, eventData: IEventData) {
  let dom = getTargetNode(event);
  do {
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
        currentEvent.event ? currentEvent.event(currentEvent.data, event) : currentEvent(event);
        if (event.cancelBubble) {
          return;
        }
      }
    }
    dom = dom.parentNode;
  } while (!isNull(dom));
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

function extendEventProperties(event) {
  // Event data needs to be object to save reference to currentTarget getter
  const eventData: IEventData = {
    dom: document as any
  };

  event.isDefaultPrevented = isDefaultPrevented;
  event.isPropagationStopped = isPropagationStopped;
  event.stopPropagation = stopPropagation;

  Object.defineProperty(event, 'currentTarget', {
    configurable: true,
    get: function get() {
      return eventData.dom;
    }
  });

  return eventData;
}

function rootClickEvent(name: string) {
  return function(event) {
    if ((event as any).button !== 0) {
      // Firefox incorrectly triggers click event for mid/right mouse buttons.
      // This bug has been active for 17 years.
      // https://bugzilla.mozilla.org/show_bug.cgi?id=184051
      event.stopPropagation();
      return;
    }

    dispatchEvents(event, true, name, extendEventProperties(event));
  };
}

function rootEvent(name: string) {
  return function(event: SemiSyntheticEvent<any>) {
    dispatchEvents(event, false, name, extendEventProperties(event));
  };
}

function attachEventToDocument(name: string) {
  const attachedEvent = name === 'onClick' || name === 'onDblClick' ? rootClickEvent(name) : rootEvent(name);

  document.addEventListener(normalizeEventName(name), attachedEvent);

  return attachedEvent;
}
