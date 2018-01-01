import { isFunction } from 'inferno-shared';
import { EMPTY_OBJ } from '../utils/common';

export function createWrappedFunction(
  methodName: string,
  applyValue?: Function
): Function {
  const fnMethod = function(e) {
    e.stopPropagation();
    const vNode = this.vNode;
    // If vNode is gone by the time event fires, no-op
    if (!vNode) {
      return;
    }
    const props = vNode.props || EMPTY_OBJ;
    const dom = vNode.dom;

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

    if (isFunction(applyValue)) {
      const newVNode = this.vNode;
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
