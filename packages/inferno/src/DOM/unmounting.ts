import type { VNode } from '../core/types';
import { isFunction, isNull, isNullOrUndef } from 'inferno-shared';
import { VNodeFlags } from 'inferno-vnode-flags';
import { unmountSyntheticEvents } from './events/delegation';
import {
  AnimationQueues,
  NO_ANIMATIONS,
  activeMoveAnimations,
  callAllAnimationHooks,
  clearVNodeDOM,
  deferRemoval,
  EMPTY_OBJ,
  findDOMFromVNode,
  findElementFromVNode,
  removeVNodeDOM,
} from './utils/common';
import { unmountRef } from '../core/refs';

export function remove(
  vNode: VNode,
  parentDOM: Element,
  animations: AnimationQueues,
): void {
  unmount(vNode, animations);
  removeVNodeDOM(vNode, parentDOM, animations);
}

export function unmount(vNode, animations: AnimationQueues): void {
  const flags = vNode.flags;
  const children = vNode.children;
  let ref;

  if ((flags & VNodeFlags.Element) !== 0) {
    ref = vNode.ref;
    unmountRef(ref);

    // Delegated handlers come from props, and the bits of $EV are the ones the element registered.
    // Elements without props skip the read from the DOM node.
    if (!isNull(vNode.props)) {
      const dom = vNode.dom;
      const bits = dom.$EV;

      if (bits) {
        unmountSyntheticEvents(dom, bits);
      }
    }

    if (flags & VNodeFlags.MultipleChildren) {
      if (flags & VNodeFlags.HasKeyedChildren) {
        if (activeMoveAnimations !== null) {
          activeMoveAnimations.unmountList(vNode);
        }
      }
      unmountAllChildren(children, animations);
    } else if (flags & VNodeFlags.HasVNodeChildren) {
      unmount(children as VNode, animations);
    }
  } else if (children) {
    if (flags & VNodeFlags.ComponentClass) {
      if (isFunction(children.componentWillUnmount)) {
        // TODO: Possible entrypoint
        children.componentWillUnmount();
      }

      // A component that animates its own removal does not let its children animate. Inside such a
      // component animations is NO_ANIMATIONS, and its hook does not run either.
      let childAnimations = animations;
      if (
        isFunction(children.componentWillDisappear) &&
        animations !== NO_ANIMATIONS
      ) {
        childAnimations = NO_ANIMATIONS;
        addDisappearAnimationHook(
          animations,
          children,
          findElementFromVNode(children.$LI),
          flags,
          undefined,
        );
      }

      if (
        activeMoveAnimations !== null &&
        isFunction(children.componentWillMove)
      ) {
        activeMoveAnimations.unmountClass(children);
      }
      unmountRef(vNode.ref);
      children.$UN = true;
      unmount(children.$LI, childAnimations);
    } else if (flags & VNodeFlags.ComponentFunction) {
      // If we have a onComponentWillDisappear on this component, block children from animating
      let childAnimations = animations;
      ref = vNode.ref;
      if (!isNullOrUndef(ref)) {
        let domEl: Element | null;

        if (isFunction(ref.onComponentWillUnmount)) {
          domEl = findDOMFromVNode(vNode, true);
          ref.onComponentWillUnmount(domEl, vNode.props || EMPTY_OBJ);
        }
        if (
          isFunction(ref.onComponentWillDisappear) &&
          animations !== NO_ANIMATIONS
        ) {
          childAnimations = NO_ANIMATIONS;
          domEl = findElementFromVNode(vNode);
          addDisappearAnimationHook(animations, ref, domEl, flags, vNode.props);
        }
        if (
          activeMoveAnimations !== null &&
          isFunction(ref.onComponentWillMove)
        ) {
          activeMoveAnimations.updateHooks(ref, null);
        }
      }
      unmount(children, childAnimations);
    } else if (flags & VNodeFlags.Portal) {
      remove(children as VNode, vNode.ref, animations);
    } else if (flags & VNodeFlags.Fragment) {
      if (flags & VNodeFlags.MultipleChildren) {
        if (
          activeMoveAnimations !== null &&
          (flags & VNodeFlags.HasKeyedChildren) !== 0
        ) {
          activeMoveAnimations.unmountList(vNode);
        }
        unmountAllChildren(children, animations);
      } else {
        unmount(children, animations);
      }
    }
  }
}

export function unmountAllChildren(
  children: VNode[],
  animations: AnimationQueues,
): void {
  for (let i = 0, len = children.length; i < len; ++i) {
    const child = children[i];
    unmount(child, animations);
  }
}

function createClearAllCallback(children, parentDOM) {
  return deferRemoval(parentDOM, () => {
    // We need to remove children one by one because elements can be added during animation
    if (parentDOM) {
      for (let i = 0, len = children.length; i < len; ++i) {
        const vNode = children[i];
        clearVNodeDOM(vNode, parentDOM, true);
      }
    }
  });
}
export function clearDOM(
  parentDOM,
  children: VNode[],
  animations: AnimationQueues,
): void {
  const hooks = animations.componentWillDisappear;
  if (hooks !== null) {
    // The leave hooks queued while unmounting children belong to this removal.
    // Wait until animations are finished before removing actual dom nodes
    // Be aware that the element could be removed by a later operation
    animations.componentWillDisappear = null;
    callAllAnimationHooks(hooks, createClearAllCallback(children, parentDOM));
  } else {
    // Optimization for clearing dom
    parentDOM.textContent = '';
  }
}

export function removeAllChildren(
  dom: Element,
  vNode: VNode,
  children,
  animations: AnimationQueues,
): void {
  unmountAllChildren(children, animations);

  if (vNode.flags & VNodeFlags.Fragment) {
    removeVNodeDOM(vNode, dom, animations);
  } else {
    clearDOM(dom, children, animations);
  }
}

// Only add animations to queue in browser
function addDisappearAnimationHook(
  animations: AnimationQueues,
  instanceOrRef,
  dom: Element | null,
  flags: VNodeFlags,
  props,
): void {
  if (dom === null) return;
  const queue =
    animations.componentWillDisappear ||
    (animations.componentWillDisappear = []);
  // @ts-expect-error TODO: Here is something weird check this behavior
  queue.push((callback) => {
    if (flags & VNodeFlags.ComponentClass) {
      instanceOrRef.componentWillDisappear(dom, callback);
    } else if (flags & VNodeFlags.ComponentFunction) {
      instanceOrRef.onComponentWillDisappear(dom, props, callback);
    }
  });
}
