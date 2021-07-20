import { isFunction, warning } from 'inferno-shared';

declare global {
  // Setting `window.__DEBUG_ANIMATIONS__ = true;` disables animation timeouts
  // allowing breakpoints in animations for debugging.
  // https://mariusschulz.com/blog/declaring-global-variables-in-typescript
  var __INFERNO_ANIMATION_DEBUG__: Boolean;
}

function filterEmpty(c) {
  return c !== '';
}

function getClassNameList(className: string) {
  return className.split(' ').filter(filterEmpty);
}

export function addClassName(node: HTMLElement, className: string) {
  const classNameList = getClassNameList(className);

  for (let i = 0; i < classNameList.length; i++) {
    node.classList.add(classNameList[i]);
  }
}

export function removeClassName(node: HTMLElement, className: string) {
  const classNameList = getClassNameList(className);

  for (let i = 0; i < classNameList.length; i++) {
    node.classList.remove(classNameList[i]);
  }
}

export function forceReflow() {
  return document.body.clientHeight;
}

// A quicker version used in pre_initialize
export function resetDisplay(node: HTMLElement, value?: string) {
  if (value !== undefined) {
    node.style.setProperty('display', value);
  } else {
    node.style.removeProperty('display');
    _cleanStyle(node);
  }
}

export function setDisplay(node: HTMLElement, value?: string) {
  const oldVal = node.style.getPropertyValue('display');

  if (oldVal !== value) {
    if (value !== undefined) {
      node.style.setProperty('display', value);
    } else {
      node.style.removeProperty('display');
      _cleanStyle(node);
    }
  }
  return oldVal;
}

function _cleanStyle(node: HTMLElement) {
  if (!node.style) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
    node.removeAttribute('style');
  }
}

export function getDimensions(node: HTMLElement) {
  const tmpDisplay = node.style.getPropertyValue('display');

  // The `display: none;` workaround was added to support Bootstrap animations in
  // https://github.com/jhsware/inferno-bootstrap/blob/be4a17bff5e785b993a66a2927846cd463fecae3/src/Modal/AnimateModal.js
  // we should consider deprecating this, or providing a different solution for
  // those who only do normal animations.
  const isDisplayNone = window.getComputedStyle(node).getPropertyValue('display') === 'none';
  if (isDisplayNone) {
    node.style.setProperty('display', 'block');
  }

  const tmp = node.getBoundingClientRect();

  if (isDisplayNone) {
    // node.style.display = tmpDisplay
    node.style.setProperty('display', tmpDisplay);
    _cleanStyle(node);
  }

  return {
    height: tmp.height,
    width: tmp.width
  };
}

export function getOffsetPosition(node: HTMLElement) {
  const {x, y} = node.getBoundingClientRect();
  return  { x, y };
}

export function getGeometry(node: HTMLElement) {
  const { x, y, width, height } = node.getBoundingClientRect();
  return { x, y, width, height };
}

export function setTransform(node: HTMLElement, x: number, y: number) {
  node.style.transform = 'translate(' + x + 'px, ' + y + 'px)'; 
}

export function clearTransform(node: HTMLElement) {
  node.style.transform = ''; 
}

export function setDimensions(node: HTMLElement, width: number, height: number) {
  node.style.width = width + 'px';
  node.style.height = height + 'px';
}

export function clearDimensions(node: HTMLElement) {
  node.style.width = node.style.height = '';
}

function _getMaxTransitionDuration(nodes) {
  let nrofTransitions = 0;
  let maxDuration = 0;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) continue;

    const cs = window.getComputedStyle(node);
    const dur = cs.getPropertyValue('transition-duration').split(',');
    const del = cs.getPropertyValue('transition-delay').split(',');
    const props = cs.getPropertyValue('transition-property').split(',');

    for (const prop in props) {
      const fixedProp = prop.trim();
      if (fixedProp[0] === '-') {
        const tmp = fixedProp.split('-').splice(2).join('-');
        // Since I increase number of transition events to expect by
        // number of durations found I need to remove browser prefix
        // variations of the same property
        if (fixedProp.indexOf(tmp) >= 0) {
          nrofTransitions--;
        }
      }
    }

    let animTimeout = 0;
    for (let j = 0; j < dur.length; j++) {
      const duration = dur[j];
      const delay = del[j];

      const tp = parseFloat(duration) + parseFloat(delay);
      if (tp > animTimeout) animTimeout = tp;
    }

    nrofTransitions += dur.length;
    // Max duration should be equal to the longest animation duration
    // of all found transitions including delay
    if (animTimeout > maxDuration) {
      maxDuration = animTimeout;
    }
  }

  return {
    maxDuration,
    nrofTransitions
  };
}

const transitionEndName: string = (function () {
  const elementStyle = document.createElement('div').style;
  // tslint:disable:object-literal-sort-keys
  const transitions = {
    transition: 'transitionend',
    OTransition: 'oTransitionEnd',
    MozTransition: 'transitionend',
    WebkitTransition: 'webkitTransitionEnd'
  };
  // tslint:enable:object-literal-sort-keys

  for (const t in transitions) {
    if (elementStyle[t] !== undefined) {
      return transitions[t];
    }
  }
})();

function setAnimationTimeout(onTransitionEnd, rootNode, maxDuration) {
  if (rootNode.nodeName === 'IMG' && !(rootNode as any).complete) {
    // Image animations should wait for loaded until the timeout is started, otherwise animation will be cut short
    // due to loading delay
    rootNode.addEventListener('load', () => {
      setTimeout(() => onTransitionEnd({ target: rootNode, timeout: true }), Math.round(maxDuration * 1000) + 100);
    });
  } else {
    setTimeout(() => onTransitionEnd({ target: rootNode, timeout: true }), Math.round(maxDuration * 1000) + 100);
  }
}

/**
 * You need to pass the root element and ALL animated children that have transitions,
 * if there are any,  so the timeout is set to the longest duration. Otherwise there
 * will be animations that fail to complete before the timeout is triggered.
 *
 * @param nodes a list of nodes that have transitions that are part of this animation
 * @param callback callback when all transitions of participating nodes are completed
 */
export function registerTransitionListener(nodes: HTMLElement[], callback: Function) {
  const rootNode = nodes[0];

  /**
   * Here comes the transition event listener
   */
  const transitionDuration = _getMaxTransitionDuration(nodes);
  const maxDuration = transitionDuration.maxDuration;
  let nrofTransitionsLeft = transitionDuration.nrofTransitions;
  let done = false;

  const onTransitionEnd = (event) => {
    // Make sure this is an actual event
    if (!event || done) {
      return;
    }

    if (!event.timeout) {
      // Make sure it isn't a child that is triggering the event
      let goAhead = false;
      for (let i = 0; i < nodes.length; i++) {
        // Note: Check for undefined nodes (happens when an animated el doesn't have children)
        if (nodes[i] !== undefined && event.target === nodes[i]) {
          goAhead = true;
          break;
        }
      }
      if (!goAhead) return;

      // Wait for all transitions
      if (--nrofTransitionsLeft > 0) {
        return;
      }
    }

    // This is it...
    done = true;

    /**
     * Perform cleanup
     */
    rootNode.removeEventListener(transitionEndName, onTransitionEnd, false);
    if (isFunction(callback)) {
      callback();
    }
  };

  rootNode.addEventListener(transitionEndName, onTransitionEnd, false);

  // Fallback if transitionend fails
  // This is disabled during debug so we can set breakpoints
  // WARNING: If the callback isn't called, the DOM nodes won't be removed
  if (!(process.env.NODE_ENV !== 'production' && isDebugAnimationsSet())) {
    setAnimationTimeout(onTransitionEnd, rootNode, maxDuration);
  } else if (process.env.NODE_ENV !== 'production') {
    warning("You are in animation debugging mode and fallback timeouts aren't set. DOM nodes could be left behind.");
  }
}

function isDebugAnimationsSet() {
  return window.__INFERNO_ANIMATION_DEBUG__ === true;
}

export function incrementMoveCbCount (node) {
  let curr = parseInt(node.dataset.moveCbCount, 10);
  if (isNaN(curr)) {
    curr = 1;
  } else {
    curr++;
  }
  node.dataset.moveCbCount = curr;
  return curr;
}

export function decrementMoveCbCount (node) {
  let curr = parseInt(node.dataset.moveCbCount, 10);
  if (isNaN(curr)) {
    curr = 0;
  } else {
    curr--;
    if (curr === 0) {
      node.dataset.moveCbCount = '';
    } else {
      node.dataset.moveCbCount = curr;
    }
  }
  return curr;
}
