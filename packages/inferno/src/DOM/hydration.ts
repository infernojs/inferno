/**
 * @module Inferno
 */ /** TypeDoc Comment */

import {
  isFunction,
  isNull,
  isNullOrUndef,
  isString,
  throwError,
  warning
} from 'inferno-shared';
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
import { EMPTY_OBJ, replaceChild } from './utils/common';
import {
  createClassComponentInstance,
  handleComponentInput
} from './utils/componentutil';
import { isSamePropsInnerHTML } from './utils/innerhtml';
import { mountProps } from './props';

function hydrateComponent(
  vNode: VNode,
  dom: Element,
  lifecycle: Function[],
  context,
  isSVG: boolean,
  isClass: boolean
) {
  const type = vNode.type as Function;
  const ref = vNode.ref;
  const props = vNode.props || EMPTY_OBJ;

  if (isClass) {
    const instance = createClassComponentInstance(
      vNode,
      type,
      props,
      context,
      lifecycle
    );
    const input = instance.$LI;

    hydrate(input, dom, lifecycle, instance.$CX, isSVG);
    vNode.dom = input.dom;
    mountClassComponentCallbacks(vNode, ref, instance, lifecycle);
    instance.$UPD = false; // Mount finished allow going sync
  } else {
    const input = handleComponentInput(type(props, context), vNode);
    hydrate(input, dom, lifecycle, context, isSVG);
    vNode.children = input;
    vNode.dom = input.dom;
    mountFunctionalComponentCallbacks(props, ref, dom, lifecycle);
  }
}

function hydrateElement(
  vNode: VNode,
  dom: Element,
  lifecycle: Function[],
  context: Object,
  isSVG: boolean
) {
  const children = vNode.children;
  const props = vNode.props;
  const className = vNode.className;
  const flags = vNode.flags;
  const ref = vNode.ref;

  isSVG = isSVG || (flags & VNodeFlags.SvgElement) > 0;
  if (dom.nodeType !== 1 || dom.tagName.toLowerCase() !== vNode.type) {
    if (process.env.NODE_ENV !== 'production') {
      warning(
        "Inferno hydration: Server-side markup doesn't match client-side markup or Initial render target is not empty"
      );
    }
    const newDom = mountElement(vNode, null, lifecycle, context, isSVG);

    vNode.dom = newDom;
    replaceChild(dom.parentNode, newDom, dom);
  } else {
    vNode.dom = dom;

    let childNode = dom.firstChild;
    const childFlags = vNode.childFlags;

    if ((childFlags & ChildFlags.HasInvalidChildren) === 0) {
      while (childNode) {
        if (childNode.nodeType === 8) {
          if ((childNode as any).data === '!') {
            const placeholder = document.createTextNode('');

            dom.replaceChild(placeholder, childNode);
            childNode = childNode.nextSibling;
          } else {
            const lastDom = childNode.previousSibling;

            dom.removeChild(childNode);
            childNode = lastDom || dom.firstChild;
          }
        } else {
          childNode = childNode.nextSibling;
        }
      }
      childNode = dom.firstChild;

      if (childFlags & ChildFlags.HasVNodeChildren) {
        if (isNull(childNode)) {
          mount(children as VNode, dom, lifecycle, context, isSVG);
        } else {
          const nextSibling = childNode.nextSibling;

          hydrate(
            children as VNode,
            childNode as Element,
            lifecycle,
            context,
            isSVG
          );
          childNode = nextSibling;
        }
      } else if (childFlags & ChildFlags.MultipleChildren) {
        for (let i = 0, len = (children as VNode[]).length; i < len; i++) {
          const child = (children as VNode[])[i];

          if (isNull(childNode)) {
            mount(child as VNode, dom, lifecycle, context, isSVG);
          } else {
            const nextSibling = childNode.nextSibling;
            hydrate(
              child as VNode,
              childNode as Element,
              lifecycle,
              context,
              isSVG
            );
            childNode = nextSibling;
          }
        }
      }

      // clear any other DOM nodes, there should be only a single entry for the root
      while (childNode) {
        const nextSibling = childNode.nextSibling;
        dom.removeChild(childNode);
        childNode = nextSibling;
      }
    } else if (!isNull(dom.firstChild) && !isSamePropsInnerHTML(dom, props)) {
      dom.textContent = ''; // dom has content, but VNode has no children remove everything from DOM
    }

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
      mountRef(dom, ref, lifecycle);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (isString(ref)) {
          throwError(
            'string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.'
          );
        }
      }
    }
  }
}

function hydrateText(vNode: VNode, dom: Element) {
  if (dom.nodeType !== 3) {
    const newDom = mountText(vNode, null);

    vNode.dom = newDom;
    replaceChild(dom.parentNode, newDom, dom);
  } else {
    const text = vNode.children;

    if (dom.nodeValue !== text) {
      dom.nodeValue = text as string;
    }
    vNode.dom = dom;
  }
}

function hydrate(
  vNode: VNode,
  dom: Element,
  lifecycle: Function[],
  context: Object,
  isSVG: boolean
) {
  const flags = vNode.flags;

  if (flags & VNodeFlags.Component) {
    hydrateComponent(
      vNode,
      dom,
      lifecycle,
      context,
      isSVG,
      (flags & VNodeFlags.ComponentClass) > 0
    );
  } else if (flags & VNodeFlags.Element) {
    hydrateElement(vNode, dom, lifecycle, context, isSVG);
  } else if (flags & VNodeFlags.Text) {
    hydrateText(vNode, dom);
  } else if (flags & VNodeFlags.Void) {
    vNode.dom = dom;
  } else {
    if (process.env.NODE_ENV !== 'production') {
      throwError(
        `hydrate() expects a valid VNode, instead it received an object with the type "${typeof vNode}".`
      );
    }
    throwError();
  }
}

export function hydrateRoot(input, parentDom: Element, lifecycle: Function[]) {
  let dom = parentDom.firstChild as Element;

  if (!isNull(dom)) {
    hydrate(input, dom, lifecycle, EMPTY_OBJ, false);
    dom = parentDom.firstChild as Element;
    // clear any other DOM nodes, there should be only a single entry for the root
    while ((dom = dom.nextSibling as Element)) {
      parentDom.removeChild(dom);
    }
    return true;
  }

  return false;
}
