import { namespaces } from './constants';
import { isFunction, isNull, isNullOrUndef, isNumber, isString, throwError } from 'inferno-shared';
import { handleEvent } from './events/delegation';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { isSameInnerHTML } from './utils/innerhtml';
import { addFormElementEventHandlers, isControlledFormElement, processElement } from './wrappers/processElement';
import { unmount, unmountAllChildren } from './unmounting';
import { VNode } from 'inferno';

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

export function getNumberStyleValue(style: string, value: number) {
  switch (style) {
    case 'animationIterationCount':
    case 'borderImageOutset':
    case 'borderImageSlice':
    case 'borderImageWidth':
    case 'boxFlex':
    case 'boxFlexGroup':
    case 'boxOrdinalGroup':
    case 'columnCount':
    case 'fillOpacity':
    case 'flex':
    case 'flexGrow':
    case 'flexNegative':
    case 'flexOrder':
    case 'flexPositive':
    case 'flexShrink':
    case 'floodOpacity':
    case 'fontWeight':
    case 'gridColumn':
    case 'gridRow':
    case 'lineClamp':
    case 'lineHeight':
    case 'opacity':
    case 'order':
    case 'orphans':
    case 'stopOpacity':
    case 'strokeDasharray':
    case 'strokeDashoffset':
    case 'strokeMiterlimit':
    case 'strokeOpacity':
    case 'strokeWidth':
    case 'tabSize':
    case 'widows':
    case 'zIndex':
    case 'zoom':
      return value;
    default:
      return value + 'px';
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
        domStyle[style] = isNumber(value) ? getNumberStyleValue(style, value) : value;
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
      domStyle[style] = isNumber(value) ? getNumberStyleValue(style, value) : value;
    }
  }
}

export function patchProp(prop, lastValue, nextValue, dom: Element, isSVG: boolean, hasControlledValue: boolean, lastVNode: VNode | null) {
  switch (prop) {
    case 'onClick':
    case 'onDblClick':
    case 'onFocusIn':
    case 'onFocusOut':
    case 'onKeyDown':
    case 'onKeyPress':
    case 'onKeyUp':
    case 'onMouseDown':
    case 'onMouseMove':
    case 'onMouseUp':
    case 'onSubmit':
    case 'onTouchEnd':
    case 'onTouchMove':
    case 'onTouchStart':
      handleEvent(prop, nextValue, dom);
      break;
    case 'children':
    case 'childrenType':
    case 'className':
    case 'defaultValue':
    case 'key':
    case 'multiple':
    case 'ref':
      return;
    case 'allowfullscreen':
    case 'autoFocus':
    case 'autoplay':
    case 'capture':
    case 'checked':
    case 'controls':
    case 'default':
    case 'disabled':
    case 'hidden':
    case 'indeterminate':
    case 'loop':
    case 'muted':
    case 'novalidate':
    case 'open':
    case 'readOnly':
    case 'required':
    case 'reversed':
    case 'scoped':
    case 'seamless':
    case 'selected':
      prop = prop === 'autoFocus' ? prop.toLowerCase() : prop;
      dom[prop] = !!nextValue;
      break;
    case 'defaultChecked':
    case 'value':
    case 'volume':
      if (hasControlledValue && prop === 'value') {
        return;
      }
      const value = isNullOrUndef(nextValue) ? '' : nextValue;
      if (dom[prop] !== value) {
        dom[prop] = value;
      }
      break;
    case 'dangerouslySetInnerHTML':
      const lastHtml = (lastValue && lastValue.__html) || '';
      const nextHtml = (nextValue && nextValue.__html) || '';
      if (lastHtml !== nextHtml) {
        if (!isNullOrUndef(nextHtml) && !isSameInnerHTML(dom, nextHtml)) {
          if (!isNull(lastVNode)) {
            if (lastVNode.childFlags & ChildFlags.MultipleChildren) {
              unmountAllChildren(lastVNode.children as VNode[]);
            } else if (lastVNode.childFlags === ChildFlags.HasVNodeChildren) {
              unmount(lastVNode.children);
            }
            lastVNode.children = null;
            lastVNode.childFlags = ChildFlags.HasInvalidChildren;
          }
          dom.innerHTML = nextHtml;
        }
      }
      break;
    default:
      if (prop[0] === 'o' && prop[1] === 'n') {
        patchEvent(prop, lastValue, nextValue, dom);
      } else if (isNullOrUndef(nextValue)) {
        dom.removeAttribute(prop);
      } else if (prop === 'style') {
        patchStyle(lastValue, nextValue, dom);
      } else if (isSVG && namespaces[prop]) {
        // We optimize for NS being boolean. Its 99.9% time false
        // If we end up in this path we can read property again
        dom.setAttributeNS(namespaces[prop], prop, nextValue);
      } else {
        dom.setAttribute(prop, nextValue);
      }
      break;
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
