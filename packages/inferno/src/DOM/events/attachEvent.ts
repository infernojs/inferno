import {isFunction} from 'inferno-shared';

export function attachEvent(dom, eventName, handler) {
  const previousKey = `$${eventName}`;
  const previousArgs = dom[previousKey];

  if (previousArgs) {
    if (previousArgs[1].wrapped) {
      return;
    }
    dom.removeEventListener(previousArgs[0], previousArgs[1]);
    dom[previousKey] = null;
  }

  if (isFunction(handler)) {
    dom.addEventListener(eventName, handler);
    dom[previousKey] = [eventName, handler];
  }
}
