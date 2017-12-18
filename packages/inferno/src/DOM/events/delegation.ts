/**
 * @module Inferno
 */ /** TypeDoc Comment */

import { isNull } from 'inferno-shared';

const delegatedEvents: Map<string, IDelegate> = new Map();

interface IDelegate {
  docEvent: any;
  items: any;
}

interface IEventData {
  dom: Element;
}

export function handleEvent(name: string, nextEvent: Function | null, dom) {
  let delegatedRoots = delegatedEvents.get(name);

  if (nextEvent) {
    if (!delegatedRoots) {
      delegatedRoots = { items: new Map(), docEvent: null };
      delegatedRoots.docEvent = attachEventToDocument(name, delegatedRoots);
      delegatedEvents.set(name, delegatedRoots);
    }
    delegatedRoots.items.set(dom, nextEvent);
  } else if (delegatedRoots) {
    const items = delegatedRoots.items;

    if (items.delete(dom)) {
      // If any items were deleted, check if listener need to be removed
      if (items.size === 0) {
        document.removeEventListener(
          normalizeEventName(name),
          delegatedRoots.docEvent
        );
        delegatedEvents.delete(name);
      }
    }
  }
}

function dispatchEvents(
  event,
  target,
  items,
  count: number,
  isClick: boolean,
  eventData: IEventData
) {
  let dom = target;
  while (count > 0 && !isNull(dom)) {
    // Html Nodes can be nested fe: span inside button in that scenario browser does not handle disabled attribute on parent,
    // because the event listener is on document.body
    // Don't process clicks on disabled elements
    if (isClick && dom.disabled) {
      return;
    }
    const eventsToTrigger = items.get(dom);

    if (eventsToTrigger) {
      count--;
      // linkEvent object
      eventData.dom = dom;
      if (eventsToTrigger.event) {
        eventsToTrigger.event(eventsToTrigger.data, event);
      } else {
        eventsToTrigger(event);
      }
      if (event.cancelBubble) {
        return;
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

function attachEventToDocument(name, delegatedRoots: IDelegate) {
  const docEvent = (event: Event) => {
    const count = delegatedRoots.items.size;

    if (count > 0) {
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

      dispatchEvents(
        event,
        event.target,
        delegatedRoots.items,
        count,
        event.type === 'click',
        eventData
      );
    }
  };
  document.addEventListener(normalizeEventName(name), docEvent);
  return docEvent;
}
