import { isArray, isNullOrUndef, isStringOrNumber } from 'inferno-shared';
import { VNodeFlags } from 'inferno-vnode-flags';

export function createContainerWithHTML(html: string): HTMLDivElement {
  const container = document.createElement('div');

  container.innerHTML = html;
  return container;
}

export function validateNodeTree(node: any): boolean {
  if (!node) {
    return true;
  }
  if (isStringOrNumber(node)) {
    return true;
  }
  const children = node.children;
  const flags = node.flags;

  if ((flags & VNodeFlags.Element) > 0) {
    if (!node.dom) {
      return false;
    }
    if (!isNullOrUndef(children)) {
      if (isArray(children)) {
        for (const child of children) {
          const val = validateNodeTree(child);

          if (!val) {
            return false;
          }
        }
      } else {
        const val = validateNodeTree(children);

        if (!val) {
          return false;
        }
      }
    }
  }
  return true;
}

export function triggerEvent(name: string, element): void {
  let eventType;

  if (
    name === 'click' ||
    name === 'dblclick' ||
    name === 'mousedown' ||
    name === 'mouseup'
  ) {
    eventType = 'MouseEvents';
  } else if (
    name === 'focus' ||
    name === 'change' ||
    name === 'blur' ||
    name === 'input' ||
    name === 'select'
  ) {
    eventType = 'HTMLEvents';
  } else {
    throw new Error('Unsupported `"' + name + '"`event');
  }
  const event = document.createEvent(eventType);
  if (eventType === 'MouseEvents') {
    // Simulate left click always
    Object.defineProperty(event, 'button', {
      value: 0,
    });
  }
  event.initEvent(name, name !== 'change', true);
  element.dispatchEvent(event);
}
