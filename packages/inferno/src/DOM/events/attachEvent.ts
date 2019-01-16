import { isNullOrUndef } from 'inferno-shared';

export function attachEvent(dom, event, handler, options = false) {
  const previousKey = `$${event}Listener`;
  const previousArgs = dom[previousKey];

  if (isNullOrUndef(handler)) {
    return detachEvent(dom, previousKey);
  }

  // if the function is wrapped, that means it's been controlled by a wrapper
  if (!previousArgs || !previousArgs[1].wrapped) {
    detachEvent(dom, previousKey);
    dom.addEventListener(event, handler, options);
    dom[previousKey] = [event, handler, options];
  }
}

function detachEvent(dom, previousKey) {
  if (dom[previousKey]) {
    dom.removeEventListener(...dom[previousKey]);
    dom[previousKey] = null;
  }
}
