/**
 * @module Inferno
 */ /** TypeDoc Comment */

import {
  isArray,
  isInvalid,
  isFunction,
  isNull,
  isNullOrUndef,
  isObject,
  isString,
  isStringOrNumber,
  throwError,
  warning
} from "inferno-shared";
import VNodeFlags from "inferno-vnode-flags";
import { InfernoChildren, VNode } from "../core/implementation";
import {
  mount,
  mountClassComponentCallbacks,
  mountElement,
  mountFunctionalComponentCallbacks,
  mountRef,
  mountText
} from "./mounting";
import { EMPTY_OBJ, replaceChild } from "./utils/common";
import {
  isControlledFormElement,
  processElement
} from "./wrappers/processElement";
import {
  createClassComponentInstance,
  handleComponentInput
} from "./utils/componentutil";
import { isSamePropsInnerHTML } from "./utils/innerhtml";
import { patchProp } from "./props";

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

    instance.$V = vNode;
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
    if (process.env.NODE_ENV !== "production") {
      warning(
        "Inferno hydration: Server-side markup doesn't match client-side markup or Initial render target is not empty"
      );
    }
    const newDom = mountElement(vNode, null, lifecycle, context, isSVG);

    vNode.dom = newDom;
    replaceChild(dom.parentNode, newDom, dom);
  } else {
    vNode.dom = dom;
    if (!isInvalid(children)) {
      hydrateChildren(children, dom, lifecycle, context, isSVG);
    } else if (!isNull(dom.firstChild) && !isSamePropsInnerHTML(dom, props)) {
      dom.textContent = ""; // dom has content, but VNode has no children remove everything from DOM
    }
    if (props) {
      let hasControlledValue = false;
      const isFormElement = (flags & VNodeFlags.FormElement) > 0;
      if (isFormElement) {
        hasControlledValue = isControlledFormElement(props);
      }
      for (const prop in props) {
        // do not add a hasOwnProperty check here, it affects performance
        patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue);
      }
      if (isFormElement) {
        processElement(flags, vNode, dom, props, true, hasControlledValue);
      }
    }
    if (!isNullOrUndef(className)) {
      if (isSVG) {
        dom.setAttribute("class", className);
      } else {
        dom.className = className;
      }
    } else {
      if (dom.className !== "") {
        dom.removeAttribute("class");
      }
    }
    if (isFunction(ref)) {
      mountRef(dom, ref, lifecycle);
    } else {
      if (process.env.NODE_ENV !== "production") {
        if (isString(ref)) {
          throwError(
            'string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.'
          );
        }
      }
    }
  }
}

function hydrateChildren(
  children: InfernoChildren,
  parentDom: Element,
  lifecycle: Function[],
  context: Object,
  isSVG: boolean
): void {
  let dom = parentDom.firstChild;

  while (dom) {
    if (dom.nodeType === 8) {
      if ((dom as any).data === "!") {
        const placeholder = document.createTextNode("");

        parentDom.replaceChild(placeholder, dom);
        dom = dom.nextSibling;
      } else {
        const lastDom = dom.previousSibling;

        parentDom.removeChild(dom);
        dom = lastDom || parentDom.firstChild;
      }
    } else {
      dom = dom.nextSibling;
    }
  }
  dom = parentDom.firstChild;

  if (isStringOrNumber(children)) {
    if (!isNull(dom) && dom.nodeType === 3) {
      if (dom.nodeValue !== children) {
        dom.nodeValue = children as string;
      }
    } else if (children === "") {
      parentDom.appendChild(document.createTextNode(""));
    } else {
      parentDom.textContent = children as string;
    }
    if (!isNull(dom)) {
      dom = (dom as Element).nextSibling;
    }
  } else if (isArray(children)) {
    for (
      let i = 0, len = (children as Array<string | number | VNode>).length;
      i < len;
      i++
    ) {
      const child = children[i];

      if (!isNull(child) && isObject(child)) {
        if (!isNull(dom)) {
          const nextSibling = dom.nextSibling;
          hydrate(child as VNode, dom as Element, lifecycle, context, isSVG);
          dom = nextSibling;
        } else {
          mount(child as VNode, parentDom, lifecycle, context, isSVG);
        }
      }
    }
  } else {
    // It's VNode
    if (!isNull(dom)) {
      hydrate(children as VNode, dom as Element, lifecycle, context, isSVG);
      dom = (dom as Element).nextSibling;
    } else {
      mount(children as VNode, parentDom, lifecycle, context, isSVG);
    }
  }

  // clear any other DOM nodes, there should be only a single entry for the root
  while (dom) {
    const nextSibling = dom.nextSibling;
    parentDom.removeChild(dom);
    dom = nextSibling;
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
    if (process.env.NODE_ENV !== "production") {
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
