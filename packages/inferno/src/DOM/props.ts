import { namespaces } from './constants';
import { isNull, isNullOrUndef, isString } from 'inferno-shared';
import { handleSyntheticEvent, syntheticEvents } from './events/delegation';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { isSameInnerHTML } from './utils/innerHTML';
import { isLastValueSameLinkEvent, normalizeEventName } from './utils/common';
import { addFormElementEventHandlers, isControlledFormElement, processElement } from './wrappers/processElement';
import { unmount, unmountAllChildren } from './unmounting';
import { VNode } from '../core/types';
import { attachEvent } from './events/attachEvent';
import { isLinkEventObject } from './events/linkEvent';

function wrapLinkEvent(nextValue) {
  // This variable makes sure there is no "this" context in callback
  const ev = nextValue.event;

  return function(e) {
    ev(nextValue.data, e);
  };
}

export function patchEvent(name: string, lastValue, nextValue, dom) {
  if (isLinkEventObject(nextValue)) {
    if (isLastValueSameLinkEvent(lastValue, nextValue)) {
      return;
    }
    nextValue = wrapLinkEvent(nextValue);
  }
  attachEvent(dom, normalizeEventName(name), nextValue);
}

// We are assuming here that we come from patchProp routine
// -nextAttrValue cannot be null or undefined
function patchStyle(lastAttrValue, nextAttrValue, dom) {
  if (isNullOrUndef(nextAttrValue)) {
    dom.removeAttribute('style');
    return;
  }
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
        domStyle.setProperty(style, value);
      }
    }

    for (style in lastAttrValue) {
      if (isNullOrUndef(nextAttrValue[style])) {
        domStyle.removeProperty(style);
      }
    }
  } else {
    for (style in nextAttrValue) {
      value = nextAttrValue[style];
      domStyle.setProperty(style, value);
    }
  }
}

function patchDangerInnerHTML(lastValue, nextValue, lastVNode, dom) {
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
}

export function patchProp(prop, lastValue, nextValue, dom: Element, isSVG: boolean, hasControlledValue: boolean, lastVNode: VNode | null) {
  switch (prop) {
    case 'children':
    case 'childrenType':
    case 'className':
    case 'defaultValue':
    case 'key':
    case 'multiple':
    case 'ref':
    case 'selectedIndex':
      break;
    case 'autoFocus':
      (dom as any).autofocus = !!nextValue;
      break;
    case 'allowfullscreen':
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
      dom[prop] = !!nextValue;
      break;
    case 'defaultChecked':
    case 'value':
    case 'volume':
      if (hasControlledValue && prop === 'value') {
        break;
      }
      const value = isNullOrUndef(nextValue) ? '' : nextValue;
      if (dom[prop] !== value) {
        dom[prop] = value;
      }
      break;
    case 'style':
      patchStyle(lastValue, nextValue, dom);
      break;
    case 'dangerouslySetInnerHTML':
      patchDangerInnerHTML(lastValue, nextValue, lastVNode, dom);
      break;
    default:
      if (syntheticEvents[prop]) {
        handleSyntheticEvent(prop, lastValue, nextValue, dom);
      } else if (prop.charCodeAt(0) === 111 && prop.charCodeAt(1) === 110) {
        patchEvent(prop, lastValue, nextValue, dom);
      } else if (isNullOrUndef(nextValue)) {
        dom.removeAttribute(prop);
      } else if (isSVG && namespaces[prop]) {
        // We optimize for isSVG being false
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
