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

export interface DelegatedEvent {
  // Mounted elements that have a handler for this event
  count: number;
  // The listener on document, while count > 0
  listener: ((event: SemiSyntheticEvent<any>) => void) | null;
  // DOM event type, for example "click"
  readonly type: keyof DocumentEventMap;
}

const delegatedEventNames: Array<keyof DelegateEventTypes> = [
  'onClick',
  'onDblClick',
  'onFocusIn',
  'onFocusOut',
  'onKeyDown',
  'onKeyPress',
  'onKeyUp',
  'onMouseDown',
  'onMouseMove',
  'onMouseUp',
  'onTouchEnd',
  'onTouchMove',
  'onTouchStart',
];

/*
 * A prop is looked up here once, and its record carries the bookkeeping, so mounting and unmounting
 * a handler does not look the name up again. The table has no prototype: props named like
 * Object.prototype members ("toString", "constructor") are not events, and a name that is not here
 * is a miss without a prototype chain lookup.
 */
export const syntheticEvents: Record<string, DelegatedEvent | undefined> =
  Object.create(null);

for (let i = 0, len = delegatedEventNames.length; i < len; ++i) {
  const name = delegatedEventNames[i];
  syntheticEvents[name] = {
    count: 0,
    listener: null,
    type: normalizeEventName(name),
  };
}

function updateOrAddSyntheticEvent(
  event: DelegatedEvent,
  name: string,
  dom,
): Partial<DelegateEventTypes> {
  let eventsObject = dom.$EV;

  if (!eventsObject) {
    // Only the handlers the element has: an object with a slot for every delegated event cost
    // 13 fields per element, which usually has one handler
    eventsObject = dom.$EV = {};
  }
  if (!eventsObject[name]) {
    if (++event.count === 1) {
      event.listener = attachEventToDocument(event.type, name);
    }
  }

  return eventsObject;
}

function releaseDelegatedEvent(event: DelegatedEvent): void {
  if (--event.count === 0) {
    document.removeEventListener(
      event.type,
      event.listener as (event: Event) => void,
    );
    event.listener = null;
  }
}

function unmountSyntheticEvent(event: DelegatedEvent, name: string, dom): void {
  const eventsObject = dom.$EV;

  if (eventsObject?.[name]) {
    releaseDelegatedEvent(event);
    eventsObject[name] = null;
  }
}

// Releases the handlers an unmounted element registered, eventsObject is its $EV
export function unmountSyntheticEvents(
  eventsObject: Partial<DelegateEventTypes>,
): void {
  for (const name in eventsObject) {
    if (eventsObject[name]) {
      releaseDelegatedEvent(syntheticEvents[name] as DelegatedEvent);
      eventsObject[name] = null;
    }
  }
}

export function handleSyntheticEvent(
  event: DelegatedEvent,
  name: string,
  lastEvent: (() => void) | LinkedEvent<any, any> | null | false | true,
  nextEvent: (() => void) | LinkedEvent<any, any> | null | false | true,
  dom,
): void {
  if (isFunction(nextEvent)) {
    updateOrAddSyntheticEvent(event, name, dom)[name] = nextEvent;
  } else if (isLinkEventObject(nextEvent)) {
    if (isLastValueSameLinkEvent(lastEvent, nextEvent)) {
      return;
    }
    updateOrAddSyntheticEvent(event, name, dom)[name] = nextEvent;
  } else {
    unmountSyntheticEvent(event, name, dom);
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
  } while (!isNull(dom));
}

function stopPropagation(): void {
  this.cancelBubble = true;

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

function rootEvent(name: string): (event: SemiSyntheticEvent<any>) => void {
  const isClick = name === 'onClick' || name === 'onDblClick';
  return function (event: SemiSyntheticEvent<any>) {
    dispatchEvents(event, isClick, name, extendEventProperties(event));
  };
}

function attachEventToDocument(
  type: keyof DocumentEventMap,
  name: string,
): (event: SemiSyntheticEvent<any>) => void {
  const attachedEvent = rootEvent(name);
  document.addEventListener(type, attachedEvent);
  return attachedEvent;
}
