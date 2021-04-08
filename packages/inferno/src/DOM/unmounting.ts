import type { VNode } from '../core/types';
import { isFunction, isNull, isNullOrUndef } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { syntheticEvents, unmountSyntheticEvent } from './events/delegation';
import { AnimationQueues, callAllAnimationHooks, clearVNodeDOM, EMPTY_OBJ, findDOMfromVNode, removeVNodeDOM } from './utils/common';
import { unmountRef } from '../core/refs';

export function remove(vNode: VNode, parentDOM: Element, animations: AnimationQueues) {
  unmount(vNode, animations);
  removeVNodeDOM(vNode, parentDOM, animations);
}

export function unmount(vNode, animations: AnimationQueues) {
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

      // If we have a componentWillDisappear on this component, block children
      let childAnimations = animations;
      if (isFunction(children.componentWillDisappear)) {
        childAnimations = new AnimationQueues();
        addDisappearAnimationHook(animations, children, children.$LI.dom, flags, undefined);
      }

      unmountRef(vNode.ref);
      children.$UN = true;
      unmount(children.$LI, childAnimations);
    } else if (flags & VNodeFlags.ComponentFunction) {
      // If we have a onComponentWillDisappear on this component, block children
      let childAnimations = animations;
      ref = vNode.ref;
      if (!isNullOrUndef(ref)) {
        const domEl = findDOMfromVNode(vNode, true) as Element;

        if (isFunction(ref.onComponentWillUnmount)) {
          ref.onComponentWillUnmount(domEl, vNode.props || EMPTY_OBJ);
        }
        if (isFunction(ref.onComponentWillDisappear)) {
          childAnimations = new AnimationQueues();
          addDisappearAnimationHook(animations, ref, domEl, flags, vNode.props);
        }
      }
      unmount(children, childAnimations);
    } else if (flags & VNodeFlags.Portal) {
      remove(children as VNode, vNode.ref, animations);
    } else if (flags & VNodeFlags.Fragment) {
      if (vNode.childFlags & ChildFlags.MultipleChildren) {
        unmountAllChildren(children, animations);
      }
    }
  }
}

export function unmountAllChildren(children: VNode[], animations: AnimationQueues) {
  for (let i = 0, len = children.length; i < len; ++i) {
    unmount(children[i], animations);
  }
}

function createClearAllCallback(children, parentDOM) {
  return function () {
    // We need to remove children one by one because elements can be added during animation
    if (parentDOM) {
      for (let i = 0; i < children.length; i++) {
        const vNode = children[i];
        clearVNodeDOM(vNode, parentDOM, false);
      }
    }
  };
}
export function clearDOM(parentDOM, children: VNode[], animations: AnimationQueues) {
  if (animations.componentWillDisappear.length > 0) {
    // Wait until animations are finished before removing actual dom nodes
    // Be aware that the element could be removed by a later operation
    callAllAnimationHooks(animations.componentWillDisappear, createClearAllCallback(children, parentDOM));
  } else {
    // Optimization for clearing dom
    parentDOM.textContent = '';
  }
}

export function removeAllChildren(dom: Element, vNode: VNode, children, animations: AnimationQueues) {
  unmountAllChildren(children, animations);

  if (vNode.flags & VNodeFlags.Fragment) {
    removeVNodeDOM(vNode, dom, animations);
  } else {
    clearDOM(dom, children, animations);
  }
}

// Only add animations to queue in browser
function addDisappearAnimationHook(animations: AnimationQueues, instanceOrRef, dom: Element, flags: VNodeFlags, props) {
  animations.componentWillDisappear.push((callback: Function) => {
    if (flags & VNodeFlags.ComponentClass) {
      instanceOrRef.componentWillDisappear(dom, callback);
    }
    else if (flags & VNodeFlags.ComponentFunction) {
      instanceOrRef.onComponentWillDisappear(dom, props, callback);
    }
  });
}
