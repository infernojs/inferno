import {isFunction, isString} from 'inferno-shared';
import {EMPTY_OBJ} from '../utils/common';

function triggerEventListener(props, methodName, e) {
  if (props[methodName]) {
    const listener = props[methodName];

    if (listener.event) {
      listener.event(listener.data, e);
    } else {
      listener(e);
    }
  } else {
    const nativeListenerName = methodName.toLowerCase();

    if (props[nativeListenerName]) {
      props[nativeListenerName](e);
    }
  }
}

export function createWrappedFunction(methodName: string | string[], applyValue?: Function): Function {
  const fnMethod = function(e) {
    const vNode = this.$V;
    // If vNode is gone by the time event fires, no-op
    if (!vNode) {
      return;
    }
    const props = vNode.props || EMPTY_OBJ;
    const dom = vNode.dom;

    if (isString(methodName)) {
      triggerEventListener(props, methodName, e);
    } else {
      for (let i = 0; i < methodName.length; ++i) {
        triggerEventListener(props, methodName[i], e);
      }
    }

    if (isFunction(applyValue)) {
      const newVNode = this.$V;
      const newProps = newVNode.props || EMPTY_OBJ;

      applyValue(newProps, dom, false, newVNode);
    }
  };

  Object.defineProperty(fnMethod, 'wrapped', {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false
  });

  return fnMethod;
}
