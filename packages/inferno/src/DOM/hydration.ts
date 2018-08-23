import { isFunction, isInvalid, isNull, isNullOrUndef, isString, throwError, warning } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { VNode } from '../core/implementation';
import {
  mount,
  mountClassComponentCallbacks,
  mountElement,
  mountFunctionalComponentCallbacks,
  mountRef,
  mountText
} from './mounting';
import { callAll, EMPTY_OBJ, LIFECYCLE, removeChild, replaceChild } from './utils/common';
import { createClassComponentInstance, handleComponentInput } from './utils/componentutil';
import { isSamePropsInnerHTML } from './utils/innerhtml';
import { mountProps } from './props';

function hydrateComponent(vNode: VNode, parentDOM: Element, dom: Element, context, isSVG: boolean, isClass: boolean) {
  const type = vNode.type as Function;
  const ref = vNode.ref;
  const props = vNode.props || EMPTY_OBJ;
  let currentNode;

  if (isClass) {
    const instance = createClassComponentInstance(vNode, type, props, context);
    const input = instance.$LI;

    currentNode = hydrateVNode(input, parentDOM, dom, instance.$CX, isSVG);
    mountClassComponentCallbacks(vNode, ref, instance);
    instance.$UPD = false; // Mount finished allow going sync
  } else {
    const input = handleComponentInput(type(props, context));
    currentNode = hydrateVNode(input, parentDOM, dom, context, isSVG);
    vNode.children = input;
    mountFunctionalComponentCallbacks(props, ref, vNode);
  }

  return currentNode;
}

function hydrateChildren(parentVNode: VNode, parentNode, currentNode, context, isSVG) {
  const childFlags = parentVNode.childFlags;
  const children = parentVNode.children;
  const props = parentVNode.props;
  const flags = parentVNode.flags;

  if (childFlags !== ChildFlags.HasInvalidChildren) {
    let nextNode;

    if (childFlags === ChildFlags.HasVNodeChildren) {
      if (isNull(currentNode)) {
        mount(children as VNode, parentNode, context, isSVG, null);
      } else {
        nextNode = currentNode.nextSibling;
        currentNode = hydrateVNode(children as VNode, parentNode, currentNode as Element, context, isSVG);
        currentNode = currentNode ? currentNode.nextSibling : nextNode;
      }
    } else if (childFlags === ChildFlags.HasTextChildren) {
      if (isNull(currentNode) || parentNode.childNodes.length !== 1 || currentNode.nodeType !== 3) {
        parentNode.textContent = children as string;
      } else {
        if (currentNode.nodeValue !== children) {
          currentNode.nodeValue = children as string;
        }
      }
      currentNode = null;
    } else if (childFlags & ChildFlags.MultipleChildren) {
      let prevVNodeIsTextNode = false;

      for (let i = 0, len = (children as VNode[]).length; i < len; i++) {
        const child = (children as VNode[])[i];

        if (isNull(currentNode) || (prevVNodeIsTextNode && (child.flags & VNodeFlags.Text) > 0)) {
          mount(child as VNode, parentNode, context, isSVG, currentNode);
        } else {
          nextNode = currentNode.nextSibling;
          currentNode = hydrateVNode(child as VNode, parentNode, currentNode as Element, context, isSVG);
          currentNode = currentNode ? currentNode.nextSibling : nextNode;
        }

        prevVNodeIsTextNode = (child.flags & VNodeFlags.Text) > 0;
      }
    }

    // clear any other DOM nodes, there should be only a single entry for the root
    if ((flags & VNodeFlags.Fragment) === 0) {
      let nextSibling: Node|null = null;

      while (currentNode) {
        nextSibling = currentNode.nextSibling;
        removeChild(parentNode, currentNode as Element);
        currentNode = nextSibling;
      }
    }
  } else if (!isNull(parentNode.firstChild) && !isSamePropsInnerHTML(parentNode, props)) {
    parentNode.textContent = ''; // dom has content, but VNode has no children remove everything from DOM
    if (flags & VNodeFlags.FormElement) {
      // If element is form element, we need to clear defaultValue also
      (parentNode as any).defaultValue = '';
    }
  }
}

function hydrateElement(vNode: VNode, parentDOM: Element, dom: Element, context: Object, isSVG: boolean) {
  const props = vNode.props;
  const className = vNode.className;
  const flags = vNode.flags;
  const ref = vNode.ref;

  isSVG = isSVG || (flags & VNodeFlags.SvgElement) > 0;
  if (dom.nodeType !== 1 || dom.tagName.toLowerCase() !== vNode.type) {
    if (process.env.NODE_ENV !== 'production') {
      warning("Inferno hydration: Server-side markup doesn't match client-side markup or Initial render target is not empty");
    }
    mountElement(vNode, null, context, isSVG, null);
    replaceChild(parentDOM, vNode.dom, dom);
  } else {
    vNode.dom = dom;

    hydrateChildren(vNode, dom, dom.firstChild, context, isSVG);

    if (!isNull(props)) {
      mountProps(vNode, flags, props, dom, isSVG);
    }
    if (isNullOrUndef(className)) {
      if (dom.className !== '') {
        dom.removeAttribute('class');
      }
    } else if (isSVG) {
      dom.setAttribute('class', className);
    } else {
      dom.className = className;
    }
    if (isFunction(ref)) {
      mountRef(dom, ref);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (isString(ref)) {
          throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
        }
      }
    }
  }

  return vNode.dom;
}

function hydrateText(vNode: VNode, parentDOM: Element, dom: Element) {
  if (dom.nodeType !== 3) {
    mountText(vNode, null, null);
    replaceChild(parentDOM, vNode.dom, dom);
  } else {
    const text = vNode.children;

    if (dom.nodeValue !== text) {
      dom.nodeValue = text as string;
    }
    vNode.dom = dom;
  }

  return vNode.dom;
}

function hydrateFragment(vNode: VNode, parentDOM: Element, dom: Element, context, isSVG: boolean): Element {
  const children = vNode.children;

  if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
    hydrateText(children as VNode, parentDOM, dom);
    return (vNode.dom = (children as any).dom);
  }

  hydrateChildren(vNode, parentDOM, dom, context, isSVG);
  return (vNode.dom = (children as any)[(children as any).length - 1].dom);
}

function hydrateVNode(vNode: VNode, parentDOM: Element, currentDom: Element, context: Object, isSVG: boolean): Element | null {
  const flags = vNode.flags |= VNodeFlags.InUse;

  if (flags & VNodeFlags.Component) {
    return hydrateComponent(vNode, parentDOM, currentDom, context, isSVG, (flags & VNodeFlags.ComponentClass) > 0);
  }
  if (flags & VNodeFlags.Element) {
    return hydrateElement(vNode, parentDOM, currentDom, context, isSVG);
  }
  if (flags & VNodeFlags.Text) {
    return hydrateText(vNode, parentDOM, currentDom);
  }
  if (flags & VNodeFlags.Void) {
    return (vNode.dom = currentDom);
  }
  if (flags & VNodeFlags.Fragment) {
    return hydrateFragment(vNode, parentDOM, currentDom, context, isSVG)
  }

  if (process.env.NODE_ENV !== 'production') {
    throwError(`hydrate() expects a valid VNode, instead it received an object with the type "${typeof vNode}".`);
  }
  throwError();

  return null;
}

export function hydrate(input, parentDom: Element, callback?: Function) {
  let dom = parentDom.firstChild as Element;

  if (!isNull(dom)) {
    if (!isInvalid(input)) {
      dom = hydrateVNode(input, parentDom, dom, EMPTY_OBJ, false) as Element;
    }
    // clear any other DOM nodes, there should be only a single entry for the root
    while (dom && (dom = dom.nextSibling as Element)) {
      removeChild(parentDom, dom);
    }
  }

  if (LIFECYCLE.length > 0) {
    callAll(LIFECYCLE);
  }

  (parentDom as any).$V = input;

  if (isFunction(callback)) {
    callback();
  }
}
