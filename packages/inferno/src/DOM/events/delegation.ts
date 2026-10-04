import type { LinkedEvent, SemiSyntheticEvent } from './../../core/types';
import { isFunction, isNull } from 'inferno-shared';
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
  // The bit of this event in an element's $EV
  readonly bit: number;
  // The element property that holds the element's handler, for example "$onClick"
  readonly prop: string;
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

// The same records in bit order, for walking the bits of an $EV
const delegatedEvents: DelegatedEvent[] = [];

for (let i = 0, len = delegatedEventNames.length; i < len; ++i) {
  const name = delegatedEventNames[i];
  const event: DelegatedEvent = {
    count: 0,
    listener: null,
    type: normalizeEventName(name),
    bit: 1 << i,
    prop: '$' + name,
  };
  syntheticEvents[name] = event;
  delegatedEvents.push(event);
}

/*
 * An element keeps its handlers in its own properties, $onClick and so on, and its $EV has a bit
 * set for each event it registered. The element has no spare in-object slots, so the first added
 * property allocates a property array with room for three: $EV and one or two handlers fit there,
 * and the element needs no object of its own for them. A handler property is read only when its
 * bit is set, so only $EV needs a default on Node.prototype, see rendering.ts.
 */
function updateOrAddSyntheticEvent(
  event: DelegatedEvent,
  handler: (() => void) | LinkedEvent<any, any>,
  dom,
): void {
  const bits = dom.$EV;

  if ((bits & event.bit) === 0) {
    dom.$EV = bits | event.bit;
    if (++event.count === 1) {
      event.listener = attachEventToDocument(event);
    }
  }
  dom[event.prop] = handler;
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

function unmountSyntheticEvent(event: DelegatedEvent, dom): void {
  const bits = dom.$EV;

  if ((bits & event.bit) !== 0) {
    dom.$EV = bits & ~event.bit;
    releaseDelegatedEvent(event);
    dom[event.prop] = null;
  }
}

// Releases the handlers an unmounted element registered, bits is its $EV and not 0
export function unmountSyntheticEvents(dom, bits: number): void {
  dom.$EV = 0;
  // Only the set bits, lowest first: bits & -bits is the lowest one, and clz32 gives its index
  do {
    const event = delegatedEvents[31 - Math.clz32(bits & -bits)];

    bits &= bits - 1;
    releaseDelegatedEvent(event);
    dom[event.prop] = null;
  } while (bits !== 0);
}

export function handleSyntheticEvent(
  event: DelegatedEvent,
  lastEvent: (() => void) | LinkedEvent<any, any> | null | false | true,
  nextEvent: (() => void) | LinkedEvent<any, any> | null | false | true,
  dom,
): void {
  if (isFunction(nextEvent)) {
    updateOrAddSyntheticEvent(event, nextEvent, dom);
  } else if (isLinkEventObject(nextEvent)) {
    if (isLastValueSameLinkEvent(lastEvent, nextEvent)) {
      return;
    }
    updateOrAddSyntheticEvent(event, nextEvent, dom);
  } else {
    unmountSyntheticEvent(event, dom);
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
  bit: number,
  prop: string,
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
    // Nodes without handlers get $EV from Node.prototype. The handler is read only when the bit is
    // set, and then it is a function or a linkEvent object
    if ((dom.$EV & bit) !== 0) {
      const currentEvent = dom[prop];

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

function rootEvent(
  delegatedEvent: DelegatedEvent,
): (event: SemiSyntheticEvent<any>) => void {
  const type = delegatedEvent.type;
  const isClick = type === 'click' || type === 'dblclick';
  const bit = delegatedEvent.bit;
  const prop = delegatedEvent.prop;
  return function (event: SemiSyntheticEvent<any>) {
    dispatchEvents(event, isClick, bit, prop, extendEventProperties(event));
  };
}

function attachEventToDocument(
  delegatedEvent: DelegatedEvent,
): (event: SemiSyntheticEvent<any>) => void {
  const attachedEvent = rootEvent(delegatedEvent);
  document.addEventListener(delegatedEvent.type, attachedEvent);
  return attachedEvent;
}
