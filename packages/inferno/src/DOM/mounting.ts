/**
 * @module Inferno
 */ /** TypeDoc Comment */

import {
  isArray,
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isObject,
  isStringOrNumber,
  isString,
  throwError
} from "inferno-shared";
import VNodeFlags from "inferno-vnode-flags";
import {
  createVoidVNode,
  directClone,
  isVNode,
  options,
  VNode
} from "../core/implementation";
import {
  appendChild,
  componentToDOMNodeMap,
  documentCreateElement,
  EMPTY_OBJ,
  setTextContent
} from "./utils/common";
import {
  isControlledFormElement,
  processElement
} from "./wrappers/processElement";
import { patchProp } from "./props";
import {
  createClassComponentInstance,
  handleComponentInput
} from "./utils/componentutil";

export function mount(
  vNode: VNode,
  parentDom: Element | null,
  lifecycle: Function[],
  context: Object,
  isSVG: boolean
) {
  const flags = vNode.flags;

  if ((flags & VNodeFlags.Element) > 0) {
    return mountElement(vNode, parentDom, lifecycle, context, isSVG);
  }

  if ((flags & VNodeFlags.Component) > 0) {
    return mountComponent(
      vNode,
      parentDom,
      lifecycle,
      context,
      isSVG,
      (flags & VNodeFlags.ComponentClass) > 0
    );
  }

  if ((flags & VNodeFlags.Void) > 0) {
    return mountText(vNode, parentDom);
  }

  if ((flags & VNodeFlags.Text) > 0) {
    return mountText(vNode, parentDom);
  }

  if ((flags & VNodeFlags.Portal) > 0) {
    mount(vNode.children as VNode, vNode.type, lifecycle, context, false);

    return (vNode.dom = mountText(createVoidVNode(), parentDom) as any);
  }

  // Development validation, in production we don't need to throw because it crashes anyway
  if (process.env.NODE_ENV !== "production") {
    if (typeof vNode === "object") {
      throwError(
        `mount() received an object that's not a valid VNode, you should stringify it first. Object: "${JSON.stringify(
          vNode
        )}".`
      );
    } else {
      throwError(
        `mount() expects a valid VNode, instead it received an object with the type "${typeof vNode}".`
      );
    }
  }
}

export function mountText(vNode: VNode, parentDom: Element | null): any {
  const dom = document.createTextNode(vNode.children as string);

  vNode.dom = dom as any;
  if (!isNull(parentDom)) {
    appendChild(parentDom, dom);
  }

  return dom;
}

export function mountElement(
  vNode: VNode,
  parentDom: Element | null,
  lifecycle: Function[],
  context: Object,
  isSVG: boolean
) {
  let dom;
  const flags = vNode.flags;

  isSVG = isSVG || (flags & VNodeFlags.SvgElement) > 0;
  dom = documentCreateElement(vNode.type, isSVG);
  const children = vNode.children;
  const props = vNode.props;
  const className = vNode.className;
  const ref = vNode.ref;

  vNode.dom = dom;

  if (!isInvalid(children)) {
    if (isStringOrNumber(children)) {
      setTextContent(dom, children as string | number);
    } else {
      const childrenIsSVG = isSVG === true && vNode.type !== "foreignObject";
      if (isArray(children)) {
        mountArrayChildren(children, dom, lifecycle, context, childrenIsSVG);
      } else if (isVNode(children as any)) {
        mount(children as VNode, dom, lifecycle, context, childrenIsSVG);
      }
    }
  }
  if (!isNull(props)) {
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

  if (className !== null) {
    if (isSVG) {
      dom.setAttribute("class", className);
    } else {
      dom.className = className;
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
  if (!isNull(parentDom)) {
    appendChild(parentDom, dom);
  }
  return dom;
}

export function mountArrayChildren(
  children,
  dom: Element,
  lifecycle: Function[],
  context: Object,
  isSVG: boolean
) {
  for (let i = 0, len = children.length; i < len; i++) {
    let child = children[i];

    if (child.dom) {
      children[i] = child = directClone(child);
    }
    mount(children[i], dom, lifecycle, context, isSVG);
  }
}

export function mountComponent(
  vNode: VNode,
  parentDom: Element | null,
  lifecycle: Function[],
  context: Object,
  isSVG: boolean,
  isClass: boolean
) {
  let dom;
  const type = vNode.type as Function;
  const props = vNode.props || EMPTY_OBJ;
  const ref = vNode.ref;

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
    vNode.dom = dom = mount(input, null, lifecycle, instance.$CX, isSVG);
    if (!isNull(parentDom)) {
      appendChild(parentDom, dom);
    }
    mountClassComponentCallbacks(vNode, ref, instance, lifecycle);
    instance.$UPD = false;
    if (options.findDOMNodeEnabled) {
      componentToDOMNodeMap.set(instance, dom);
    }
  } else {
    const input = handleComponentInput(type(props, context), vNode);
    vNode.dom = dom = mount(input, null, lifecycle, context, isSVG);
    vNode.children = input;
    mountFunctionalComponentCallbacks(props, ref, dom, lifecycle);
    if (!isNull(parentDom)) {
      appendChild(parentDom, dom);
    }
  }
  return dom;
}

function createClassMountCallback(instance, hasAfterMount, afterMount, vNode, hasDidMount) {
  return () => {
    instance.$UPD = true;
    if (hasAfterMount) {
      (afterMount as Function)(vNode);
    }
    if (hasDidMount) {
      instance.componentDidMount();
    }
    instance.$UPD = false;
  };
}

export function mountClassComponentCallbacks(
  vNode: VNode,
  ref,
  instance,
  lifecycle: Function[]
) {
  if (isFunction(ref)) {
    ref(instance);
  } else {
    if (process.env.NODE_ENV !== "production") {
      if (isStringOrNumber(ref)) {
        throwError(
          'string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.'
        );
      } else if (!isNullOrUndef(ref) && isObject(ref) && vNode.flags & VNodeFlags.ComponentClass) {
        throwError(
          "functional component lifecycle events are not supported on ES2015 class components."
        );
      }
    }
  }
  const hasDidMount = isFunction(instance.componentDidMount);
  const afterMount = options.afterMount;
  const hasAfterMount = isFunction(afterMount);

  if (hasDidMount || hasAfterMount) {
    lifecycle.push(createClassMountCallback(instance, hasAfterMount, afterMount, vNode, hasDidMount));
  }
}

// Create did mount callback lazily to avoid creating function context if not needed
function createOnMountCallback(ref, dom, props) {
  return () => ref.onComponentDidMount(dom, props);
}

export function mountFunctionalComponentCallbacks(
  props,
  ref,
  dom,
  lifecycle: Function[]
) {
  if (!isNullOrUndef(ref)) {
    if (isFunction(ref.onComponentWillMount)) {
      ref.onComponentWillMount(props);
    }
    if (isFunction(ref.onComponentDidMount)) {
      lifecycle.push(createOnMountCallback(ref, dom, props));
    }
  }
}

export function mountRef(dom: Element, value, lifecycle: Function[]) {
  lifecycle.push(() => value(dom));
}
