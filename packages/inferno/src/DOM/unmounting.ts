import type { VNode } from '../core/types';
import { isFunction, isNull, isNullOrUndef } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { syntheticEvents, unmountSyntheticEvent } from './events/delegation';
import { EMPTY_OBJ, findDOMfromVNode, removeVNodeDOM } from './utils/common';
import { unmountRef } from '../core/refs';

export function remove(vNode: VNode, parentDOM: Element, animations: Function[]) {
  unmount(vNode, animations);
  
  let animsLeft = animations.length;
  if (animsLeft > 0) {
    // Wait until animations are finished before removing actual dom nodes
    callAllAnimationHooks(animations, () => {
      if (--animsLeft <= 0) {
        // When all animations are done, remove everything.
        // NOTE: If we add a sibling when the animation is active, will it be removed?
        removeVNodeDOM(vNode, parentDOM);
      }
    });
  }
  else {
    removeVNodeDOM(vNode, parentDOM);
  }
}

export function unmount(vNode, animations: Function[]) {
  const flags = vNode.flags;
  const children = vNode.children;
  let ref;

  if (flags & VNodeFlags.Element) {
    ref = vNode.ref as any;
    const props = vNode.props;

    unmountRef(ref);

    const childFlags = vNode.childFlags;

    if (!isNull(props)) {
      const keys = Object.keys(props);

      for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        if (syntheticEvents[key]) {
          unmountSyntheticEvent(key, vNode.dom);
        }
      }
    }

    if (childFlags & ChildFlags.MultipleChildren) {
      unmountAllChildren(children, animations);
    } else if (childFlags === ChildFlags.HasVNodeChildren) {
      unmount(children as VNode, animations);
    }
  } else if (children) {
    if (flags & VNodeFlags.ComponentClass) {
      if (isFunction(children.componentWillUnmount)) {
        // TODO: Possible entrypoint
        children.componentWillUnmount();
      }

      // If we have a willDisappear on this component, block children
      let childAnimations = animations;
      if (isFunction(children.willDisappear)) {
        childAnimations = [];
        animations.push(createClassAnimationHook(children, children.$LI.dom));
      }

      unmountRef(vNode.ref);
      children.$UN = true;
      unmount(children.$LI, childAnimations);
    } else if (flags & VNodeFlags.ComponentFunction) {
      ref = vNode.ref;

      if (!isNullOrUndef(ref) && isFunction(ref.onComponentWillUnmount)) {
        // TODO: Possible entrypoint
        ref.onComponentWillUnmount(findDOMfromVNode(vNode, true) as Element, vNode.props || EMPTY_OBJ);
      }

      unmount(children, animations);
    } else if (flags & VNodeFlags.Portal) {
      // TODO: Possible entrypoint
      remove(children as VNode, vNode.ref, animations);
    } else if (flags & VNodeFlags.Fragment) {
      if (vNode.childFlags & ChildFlags.MultipleChildren) {
        // TODO: Possible entrypoint
        unmountAllChildren(children, animations);
      }
    }
  }
}

export function unmountAllChildren(children: VNode[], animations: Function[]) {
  for (let i = 0, len = children.length; i < len; ++i) {
    unmount(children[i], animations);
  }
}

export function clearDOM(dom) {
  // Optimization for clearing dom
  dom.textContent = '';
}

export function removeAllChildren(dom: Element, vNode: VNode, children, animations: Function[]) {
  unmountAllChildren(children, animations);

  if (vNode.flags & VNodeFlags.Fragment) {
    removeVNodeDOM(vNode, dom);
  } else {
    clearDOM(dom);
  }
}

function createClassAnimationHook(instance, dom: Element) {
  return (callback: Function) => {
    instance.willDisappear(dom, callback);
  };
}

function callAllAnimationHooks(arrayFn: Function[], callback: Function) {
  for (let i = 0; i < arrayFn.length; i++) {
    const fn = arrayFn.pop();
    // This check shouldn't be needed but TS complains so adding it
    if (fn !== undefined) {
      fn(callback);
    }
  }
}
