import { isString, isFunction } from 'inferno-shared';

declare global {
  // Setting `window.__DEBUG_ANIMATIONS__ = true;` disables animation timeouts
  // allowing breakpoints in animations for debugging.
  // https://mariusschulz.com/blog/declaring-global-variables-in-typescript
  var __INFERNO_ANIMATION_DEBUG__: Boolean;
}

export function addClassName (node: HTMLElement, className: string) {
  if (isString(className)) {
    const tmp = className.split(' ');
    for (let i=0; i < tmp.length; i++) {
      node.classList.add(tmp[i]);
    }
  }
}

export function removeClassName (node: HTMLElement, className: string) {
  if (isString(className)) {
    const tmp = className.split(' ');
    for (let i=0; i < tmp.length; i++) {
      node.classList.remove(tmp[i]);
    }
  }
}

export function forceReflow () {
  return document.body.clientHeight;
}

export function setDisplay(node: HTMLElement, value?: string) {
  var oldVal = node.style.getPropertyValue('display');
  if (oldVal !== value) {
    if (value !== undefined) {
      node.style.setProperty('display', value);
    }
    else {
      node.style.removeProperty('display');
      _cleanStyle(node);
    }
  }
  return oldVal
}

function _cleanStyle(node: HTMLElement) {
  if (!node.style) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
    node.removeAttribute('style');
  }
}

export function getDimensions(node: HTMLElement) {
  var tmpDisplay = node.style.getPropertyValue('display');

  // The `display: none;` workaround was added to support Bootstrap animations in
  // https://github.com/jhsware/inferno-bootstrap/blob/be4a17bff5e785b993a66a2927846cd463fecae3/src/Modal/AnimateModal.js
  // we should consider deprecating this, or providing a different solution for
  // those who only do normal animations.
  var isDisplayNone = window.getComputedStyle(node).getPropertyValue('display') === 'none';
  if (isDisplayNone) {
    node.style.setProperty('display', 'block');
  }

  var tmp = node.getBoundingClientRect();

  if (isDisplayNone) {
    // node.style.display = tmpDisplay
    node.style.setProperty('display', tmpDisplay);
    _cleanStyle(node);
  }

  return {
    width: tmp.width,
    height: tmp.height
  }
}

export function setDimensions(node: HTMLElement, width: number, height: number) {
  node.style.width = width + 'px';
  node.style.height = height + 'px';
}

export function clearDimensions(node: HTMLElement) {
  node.style.width = node.style.height = '';
}

function _getMaxTransitionDuration (nodes) {
  let nrofTransitions = 0;
  let maxDuration = 0;
  for (let i=0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) continue;

    const cs = window.getComputedStyle(node);
    const dur = cs.getPropertyValue('transition-duration').split(',');
    const del = cs.getPropertyValue('transition-delay').split(',');
    const props = cs.getPropertyValue('transition-property').split(',');

    for (let prop in props) {
      const fixedProp = prop.trim();
      if (fixedProp[0] === '-') {
        let tmp = fixedProp.split('-').splice(2).join('-');
        // Since I increase number of transition events to expect by
        // number of durations found I need to remove browser prefix
        // variations of the same property
        if (fixedProp.indexOf(tmp) >= 0) {
          nrofTransitions--;
        }
      }      
    }

    let animTimeout = 0;
    for (let i = 0; i < dur.length; i++) {
      const duration = dur[i];
      const delay = del[i];
      animTimeout += parseFloat(duration) + parseFloat(delay);
    }

    nrofTransitions += dur.length;
    // Max duration should be equal to the longest animation duration
    // of all found transitions including delay
    if (animTimeout > maxDuration) {
      maxDuration = animTimeout;
    }
  }

  return {
    nrofTransitions: nrofTransitions,
    maxDuration: maxDuration
  }
}

function whichTransitionEvent(){
  var el = document.createElement('fakeelement');
  var transitions = {
    'transition':'transitionend',
    'OTransition':'oTransitionEnd',
    'MozTransition':'transitionend',
    'WebkitTransition':'webkitTransitionEnd'
  }

  for(let t in transitions){
      if( el.style[t] !== undefined ){
          return transitions[t];
      }
  }
}
var transitionEndName: string = whichTransitionEvent();

/**
 * You need to pass the root element and ALL animated children that have transitions,
 * if there are any,  so the timeout is set to the longest duration. Otherwise there
 * will be animations that fail to complete before the timeout is triggered.
 */
export function registerTransitionListener(nodes: HTMLElement[], callback: Function, noTimeout: boolean = false) {
  if (!Array.isArray(nodes)) {
    nodes = [nodes];
  }
  else {
    // Make sure we don't have undefined nodes (happens when an animated el doesn't have children)
    nodes = nodes.filter((node) => node);
  }
  const rootNode = nodes[0];

  /**
   * Here comes the transition event listener
   */
  let { nrofTransitions: nrofTransitionsLeft, maxDuration } = _getMaxTransitionDuration(nodes);
  let done = false;

  function onTransitionEnd (event) {
    // Make sure this is an actual event
    if (!event || done) {
      return;
    }

    if (!event.timeout) {
      // Make sure it isn't a child that is triggering the event
      var goAhead = false;
      for (var i=0; i < nodes.length; i++) {
        if (event.target === nodes[i]) {
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
  }
  rootNode.addEventListener(transitionEndName, onTransitionEnd, false);

  // Fallback if transitionend fails
  // This is disabled during debug so we can set breakpoints
  if (!(process.env.NODE_ENV !== 'production' && isDebugAnimationsSet()) && !noTimeout) {
    if (rootNode.nodeName === 'IMG' && !(rootNode as any).complete) {
      // Image animations should wait for loaded until the timeout is started, otherwise animation will be cut short
      // due to loading delay
      rootNode.addEventListener('load', () => {
        setTimeout(() => onTransitionEnd({ target: rootNode, timeout: true }), Math.round(maxDuration * 1000) + 100);
      })
    }
    else {
      setTimeout(() => onTransitionEnd({ target: rootNode, timeout: true }), Math.round(maxDuration * 1000) + 100);
    }
  }
}

function isDebugAnimationsSet () {
  return window.__INFERNO_ANIMATION_DEBUG__ === true
}
