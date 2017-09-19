/**
 * @module Inferno
 */ /** TypeDoc Comment */

import {
  booleanProps,
  delegatedEvents,
  isUnitlessNumber,
  namespaces,
  skipProps,
  strictProps
} from "./constants";
import {
  isFunction,
  isNullOrUndef,
  isNumber,
  isString,
  throwError
} from "inferno-shared";
import { handleEvent } from "./events/delegation";
import VNodeFlags from "inferno-vnode-flags";
import { isSameInnerHTML } from "./utils/innerhtml";

export function isAttrAnEvent(attr: string): boolean {
  return attr[0] === "o" && attr[1] === "n";
}

export function patchEvent(name: string, lastValue, nextValue, dom) {
  if (lastValue !== nextValue) {
    if (delegatedEvents.has(name)) {
      handleEvent(name, nextValue, dom);
    } else {
      const nameLowerCase = name.toLowerCase();
      const domEvent = dom[nameLowerCase];
      // if the function is wrapped, that means it's been controlled by a wrapper
      if (domEvent && domEvent.wrapped) {
        return;
      }
      if (!isFunction(nextValue) && !isNullOrUndef(nextValue)) {
        const linkEvent = nextValue.event;

        if (linkEvent && isFunction(linkEvent)) {
          dom[nameLowerCase] = function(e) {
            linkEvent(nextValue.data, e);
          };
        } else {
          if (process.env.NODE_ENV !== "production") {
            throwError(
              `an event on a VNode "${name}". was not a function or a valid linkEvent.`
            );
          }
          throwError();
        }
      } else {
        dom[nameLowerCase] = nextValue;
      }
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
        domStyle[style] =
          !isNumber(value) || isUnitlessNumber.has(style)
            ? value
            : value + "px";
      }
    }

    for (style in lastAttrValue) {
      if (isNullOrUndef(nextAttrValue[style])) {
        domStyle[style] = "";
      }
    }
  } else {
    for (style in nextAttrValue) {
      value = nextAttrValue[style];
      domStyle[style] =
        !isNumber(value) || isUnitlessNumber.has(style) ? value : value + "px";
    }
  }
}

export function removeProp(prop: string, lastValue, dom, nextFlags: number) {
  if (prop === "value") {
    // When removing value of select element, it needs to be set to null instead empty string, because empty string is valid value for option which makes that option selected
    // MS IE/Edge don't follow html spec for textArea and input elements and we need to set empty string to value in those cases to avoid "null" and "undefined" texts
    dom.value = nextFlags & VNodeFlags.SelectElement ? null : "";
  } else if (prop === "style") {
    dom.removeAttribute("style");
  } else if (isAttrAnEvent(prop)) {
    handleEvent(prop, null, dom);
  } else {
    dom.removeAttribute(prop);
  }
}

export function patchProp(
  prop,
  lastValue,
  nextValue,
  dom: Element,
  isSVG: boolean,
  hasControlledValue: boolean
) {
  if (lastValue !== nextValue) {
    if (skipProps.has(prop) || (hasControlledValue && prop === "value")) {
      return;
    } else if (booleanProps.has(prop)) {
      prop = prop === "autoFocus" ? prop.toLowerCase() : prop;
      dom[prop] = !!nextValue;
    } else if (strictProps.has(prop)) {
      const value = isNullOrUndef(nextValue) ? "" : nextValue;

      if (dom[prop] !== value) {
        dom[prop] = value;
      }
    } else if (isAttrAnEvent(prop)) {
      patchEvent(prop, lastValue, nextValue, dom);
    } else if (isNullOrUndef(nextValue)) {
      dom.removeAttribute(prop);
    } else if (prop === "style") {
      patchStyle(lastValue, nextValue, dom);
    } else if (prop === "dangerouslySetInnerHTML") {
      const lastHtml = lastValue && lastValue.__html;
      const nextHtml = nextValue && nextValue.__html;

      if (lastHtml !== nextHtml) {
        if (!isNullOrUndef(nextHtml) && !isSameInnerHTML(dom, nextHtml)) {
          dom.innerHTML = nextHtml;
        }
      }
    } else {
      // We optimize for NS being boolean. Its 99.9% time false
      if (isSVG && namespaces.has(prop)) {
        // If we end up in this path we can read property again
        dom.setAttributeNS(namespaces.get(prop) as string, prop, nextValue);
      } else {
        dom.setAttribute(prop, nextValue);
      }
    }
  }
}
