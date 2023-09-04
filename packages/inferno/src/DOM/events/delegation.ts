import type { LinkedEvent, SemiSyntheticEvent } from './../../core/types';
import { isFunction, isNull, isNullOrUndef } from 'inferno-shared';
import {
  isLastValueSameLinkEvent,
  normalizeEventName,
} from './../utils/common';
import { isLinkEventObject } from './linkEvent';

interface IEventData {
  dom: Element;
}

export interface DelegateEventTypes {
  onClick: unknown;
  onDblClick: unknown;
  onFocusIn: unknown;
  onFocusOut: unknown;
  onKeyDown: unknown;
  onKeyPress: unknown;
  onKeyUp: unknown;
  onMouseDown: unknown;
  onMouseMove: unknown;
  onMouseUp: unknown;
  onTouchEnd: unknown;
  onTouchMove: unknown;
  onTouchStart: unknown;
}

function getDelegatedEventObject(v: unknown): DelegateEventTypes {
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
    onTouchStart: v,
  };
}
const attachedEventCounts = getDelegatedEventObject(0);
const attachedEvents = getDelegatedEventObject(null);

export const syntheticEvents = getDelegatedEventObject(true);

function updateOrAddSyntheticEvent(name: string, dom): DelegateEventTypes {
  let eventsObject = dom.$EV;

  if (!eventsObject) {
    eventsObject = dom.$EV = getDelegatedEventObject(null);
  }
  if (!eventsObject[name]) {
    if (++attachedEventCounts[name] === 1) {
      attachedEvents[name] = attachEventToDocument(name);
    }
  }

  return eventsObject;
}

export function unmountSyntheticEvent(name: string, dom): void {
  const eventsObject = dom.$EV;

  if (eventsObject?.[name]) {
    if (--attachedEventCounts[name] === 0) {
      document.removeEventListener(
        normalizeEventName(name),
        attachedEvents[name],
      );
      attachedEvents[name] = null;
    }
    eventsObject[name] = null;
  }
}

export function handleSyntheticEvent(
  name: string,
  lastEvent: (() => void) | LinkedEvent<any, any> | null | false | true,
  nextEvent: (() => void) | LinkedEvent<any, any> | null | false | true,
  dom,
): void {
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

// TODO: When browsers fully support event.composedPath we could loop it through instead of using parentNode property
function getTargetNode(event): any {
  return isFunction(event.composedPath)
    ? event.composedPath()[0]
    : event.target;
}

function dispatchEvents(
  event: SemiSyntheticEvent<any>,
  isClick: boolean,
  name: string,
  eventData: IEventData,
): void {
  let dom = getTargetNode(event);
  do {
    // Html Nodes can be nested fe: span inside button in that scenario browser does not handle disabled attribute on parent,
    // because the event listener is on document.body
    // Don't process clicks on disabled elements
    if (isClick && dom.disabled) {
      return;
    }
    const eventsObject = dom.$EV;

    if (!isNullOrUndef(eventsObject)) {
      const currentEvent = eventsObject[name];

      if (currentEvent) {
        // linkEvent object
        eventData.dom = dom;
        currentEvent.event
          ? currentEvent.event(currentEvent.data, event)
          : currentEvent(event);
        if (event.cancelBubble) {
          return;
        }
      }
    }
    dom = dom.parentNode;
  } while (!isNull(dom));
}

function stopPropagation(): void {
  this.cancelBubble = true;

  // eslint-disable-next-line
  if (!this.immediatePropagationStopped) {
    this.stopImmediatePropagation();
  }
}

function isDefaultPrevented(): boolean {
  return this.defaultPrevented;
}

function isPropagationStopped(): boolean {
  return this.cancelBubble;
}

function extendEventProperties(event): IEventData {
  // Event data needs to be an object to save reference to currentTarget getter
  const eventData: IEventData = {
    dom: document as any,
  };

  event.isDefaultPrevented = isDefaultPrevented;
  event.isPropagationStopped = isPropagationStopped;
  event.stopPropagation = stopPropagation;

  Object.defineProperty(event, 'currentTarget', {
    configurable: true,
    get: function get() {
      return eventData.dom;
    },
  });

  return eventData;
}

function rootClickEvent(name: string) {
  return function (event) {
    if (event.button !== 0) {
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
  return function (event: SemiSyntheticEvent<any>) {
    dispatchEvents(event, false, name, extendEventProperties(event));
  };
}

function attachEventToDocument(
  name: string,
): (event: SemiSyntheticEvent<any>) => void {
  const attachedEvent =
    name === 'onClick' || name === 'onDblClick'
      ? rootClickEvent(name)
      : rootEvent(name);

  // @ts-expect-error TODO: FIXME
  document.addEventListener(normalizeEventName(name), attachedEvent);

  return attachedEvent;
}
