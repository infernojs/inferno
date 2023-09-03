import { isFunction, isNullOrUndef, isString } from 'inferno-shared';
import { EMPTY_OBJ } from '../utils/common';
import { type NonEmptyProps, type VNode } from '../../core/types';

function triggerEventListener(
  props: NonEmptyProps,
  methodName: string,
  e: any,
): void {
  const listener = props[methodName] as any;

  if (listener) {
    if (listener.event) {
      listener.event(listener.data, e);
    } else {
      listener(e);
    }
  } else {
    const nativeListenerName = methodName.toLowerCase();

    if (isFunction(props[nativeListenerName])) {
      (props[nativeListenerName] as (e) => void)(e);
    }
  }
}

export function createWrappedFunction(
  methodName: string | string[],
  applyValue?: (
    newProps: NonEmptyProps,
    dom: any,
    isMounting: boolean,
    newVNode: VNode,
  ) => void,
): (e: Event) => void {
  const fnWrapper = function fnWrapper(e: Event): void {
    const vNode = this.$V as VNode;
    // If vNode is gone by the time event fires, no-op
    if (isNullOrUndef(vNode)) {
      return;
    }
    const props = vNode.props ?? EMPTY_OBJ;
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
      const newProps = newVNode.props ?? EMPTY_OBJ;

      applyValue(newProps, dom, false, newVNode);
    }
  };

  Object.defineProperty(fnWrapper, 'wrapped', {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  });

  return fnWrapper;
}
