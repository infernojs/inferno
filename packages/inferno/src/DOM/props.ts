/**
 * @module Inferno
 */ /** TypeDoc Comment */

import { booleanProps, delegatedEvents, isUnitlessNumber, namespaces, skipProps, strictProps } from './constants';
import { isDefined, isFunction, isNull, isNullOrUndef, isNumber, isString, throwError } from 'inferno-shared';
import { handleEvent } from './events/delegation';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { isSameInnerHTML } from './utils/innerhtml';
import { addFormElementEventHandlers, isControlledFormElement, processElement } from './wrappers/processElement';
import { unmount, unmountAllChildren } from './unmounting';
import { VNode } from 'inferno';

export function isAttrAnEvent(attr: string): boolean {
  return attr[0] === 'o' && attr[1] === 'n';
}

function createLinkEvent(linkEvent, nextValue) {
  return function(e) {
    linkEvent(nextValue.data, e);
  };
}

export function patchEvent(name: string, lastValue, nextValue, dom) {
  const nameLowerCase = name.toLowerCase();

  if (!isFunction(nextValue) && !isNullOrUndef(nextValue)) {
    const linkEvent = nextValue.event;

    if (linkEvent && isFunction(linkEvent)) {
      dom[nameLowerCase] = createLinkEvent(linkEvent, nextValue);
    } else {
      // Development warning
      if (process.env.NODE_ENV !== 'production') {
        throwError(`an event on a VNode "${name}". was not a function or a valid linkEvent.`);
      }
    }
  } else {
    const domEvent = dom[nameLowerCase];
    // if the function is wrapped, that means it's been controlled by a wrapper
    if (!domEvent || !domEvent.wrapped) {
      dom[nameLowerCase] = nextValue;
    }
  }
}

// We are assuming here that we come from patchProp routine
// -nextAttrValue cannot be null or undefined
function patchStyle(lastAttrValue, nextAttrValue, dom) {
  const domStyle = dom.style;
  let style;
  let value;

  if (isString(nextAttrValue)) {
    domStyle.cssText = nextAttrValue;
    return;
  }

  if (!isNullOrUndef(lastAttrValue) && !isString(lastAttrValue)) {
    for (style in nextAttrValue) {
      // do not add a hasOwnProperty check here, it affects performance
      value = nextAttrValue[style];
      if (value !== lastAttrValue[style]) {
        domStyle[style] = !isNumber(value) || isDefined(isUnitlessNumber[style]) ? value : value + 'px';
      }
    }

    for (style in lastAttrValue) {
      if (isNullOrUndef(nextAttrValue[style])) {
        domStyle[style] = '';
      }
    }
  } else {
    for (style in nextAttrValue) {
      value = nextAttrValue[style];
      domStyle[style] = !isNumber(value) || isDefined(isUnitlessNumber[style]) ? value : value + 'px';
    }
  }
}

export function patchProp(prop, lastValue, nextValue, dom: Element, isSVG: boolean, hasControlledValue: boolean, lastVNode: VNode | null) {
  if (lastValue !== nextValue) {
    if (isDefined(delegatedEvents[prop])) {
      handleEvent(prop, nextValue, dom);
    } else if (isDefined(skipProps[prop]) || (hasControlledValue && prop === 'value')) {
      return;
    } else if (isDefined(booleanProps[prop])) {
      prop = prop === 'autoFocus' ? prop.toLowerCase() : prop;
      dom[prop] = !!nextValue;
    } else if (isDefined(strictProps[prop])) {
      const value = isNullOrUndef(nextValue) ? '' : nextValue;

      if (dom[prop] !== value) {
        dom[prop] = value;
      }
    } else if (isAttrAnEvent(prop)) {
      patchEvent(prop, lastValue, nextValue, dom);
    } else if (isNullOrUndef(nextValue)) {
      dom.removeAttribute(prop);
    } else if (prop === 'style') {
      patchStyle(lastValue, nextValue, dom);
    } else if (prop === 'dangerouslySetInnerHTML') {
      const lastHtml = (lastValue && lastValue.__html) || '';
      const nextHtml = (nextValue && nextValue.__html) || '';

      if (lastHtml !== nextHtml) {
        if (!isNullOrUndef(nextHtml) && !isSameInnerHTML(dom, nextHtml)) {
          if (!isNull(lastVNode)) {
            if (lastVNode.childFlags & ChildFlags.MultipleChildren) {
              unmountAllChildren(lastVNode.children as VNode[]);
            } else if (lastVNode.childFlags & ChildFlags.HasVNodeChildren) {
              unmount(lastVNode.children);
            }
            lastVNode.children = null;
            lastVNode.childFlags = ChildFlags.HasInvalidChildren;
          }
          dom.innerHTML = nextHtml;
        }
      }
    } else if (isSVG && namespaces[prop]) {
      // We optimize for NS being boolean. Its 99.9% time false
      // If we end up in this path we can read property again
      dom.setAttributeNS(namespaces[prop] as string, prop, nextValue);
    } else {
      dom.setAttribute(prop, nextValue);
    }
  }
}

export function mountProps(vNode, flags, props, dom, isSVG) {
  let hasControlledValue: boolean = false;
  const isFormElement = (flags & VNodeFlags.FormElement) > 0;
  if (isFormElement) {
    hasControlledValue = isControlledFormElement(props);
    if (hasControlledValue) {
      addFormElementEventHandlers(flags, dom, props);
    }
  }
  for (const prop in props) {
    // do not add a hasOwnProperty check here, it affects performance
    patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue, null);
  }
  if (isFormElement) {
    processElement(flags, vNode, dom, props, true, hasControlledValue);
  }
}
