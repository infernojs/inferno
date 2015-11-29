import ExecutionEnvironment from '../../util/ExecutionEnvironment';

let useHasFeature;
if (ExecutionEnvironment.canUseDOM) {
  useHasFeature = document.implementation && document.implementation.hasFeature &&
  // always returns true in newer browsers as per the standard.
  // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
  document.implementation.hasFeature('', '') !== true;
}


function isEventSupported(eventNameSuffix, capture) {
  if (!ExecutionEnvironment.canUseDOM) {
    return false;
  }

  const eventName = 'on' + eventNameSuffix;
  let isSupported = (eventName in document);

  if (!isSupported) {
    let element = document.createElement('div');
    element.setAttribute(eventName, 'return;');
    isSupported = typeof element[eventName] === 'function';
  }

  if (!isSupported && useHasFeature && eventNameSuffix === 'wheel') {
    // This is the only way to test support for the `wheel` event in IE9+.
    isSupported = document.implementation.hasFeature('Events.wheel', '3.0');
  }

  return isSupported;
}

export default isEventSupported;