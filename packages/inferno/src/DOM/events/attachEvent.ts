import { isFunction } from 'inferno-shared';

export function attachEvent(dom, event, handler) {
  const previousKey = `$${event}`;
  const previousArgs = dom[previousKey];

  if (previousArgs && previousArgs[1].wrapped) {
    return;
  }

  if (previousArgs) {
    dom.removeEventListener.apply(dom, previousArgs);
    dom[previousKey] = null;
  }

  if (isFunction(handler)) {
    dom.addEventListener(event, handler);
    dom[previousKey] = [event, handler];
  }
}
