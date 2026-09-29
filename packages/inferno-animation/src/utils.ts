import { isFunction } from 'inferno-shared';

export interface Dimensions {
  height: number;
  width: number;
  x: number;
  y: number;
}

function filterEmpty(c: string): boolean {
  return c !== '';
}

function getClassNameList(className: string): string[] {
  return className.split(' ').filter(filterEmpty);
}

export function addClassName(
  node: HTMLElement | SVGElement,
  className: string,
): void {
  const classNameList = getClassNameList(className);

  for (let i = 0; i < classNameList.length; i++) {
    node.classList.add(classNameList[i]);
  }
}

export function removeClassName(
  node: HTMLElement | SVGElement,
  className: string,
): void {
  const classNameList = getClassNameList(className);

  for (let i = 0; i < classNameList.length; i++) {
    node.classList.remove(classNameList[i]);
  }
}

export function forceReflow(): number {
  return document.body.clientHeight;
}

// A quicker version used in pre_initialize
export function resetDisplay(
  node: HTMLElement | SVGElement,
  value?: string,
): void {
  if (value !== undefined) {
    node.style.setProperty('display', value);
  } else {
    node.style.removeProperty('display');
    _cleanStyle(node);
  }
}

export function setDisplay(
  node: HTMLElement | SVGElement,
  value?: string,
): string {
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

function _cleanStyle(node: HTMLElement | SVGElement): void {
  if (!node.style) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
    node.removeAttribute('style');
  }
}

export function getDimensions(node: HTMLElement | SVGElement): Dimensions {
  let rect = node.getBoundingClientRect();

  // The `display: none;` workaround was added to support Bootstrap animations in
  // https://github.com/jhsware/inferno-bootstrap/blob/be4a17bff5e785b993a66a2927846cd463fecae3/src/Modal/AnimateModal.js
  // we should consider deprecating this, or providing a different solution for
  // those who only do normal animations. Only an element without a box can be hidden that way.
  if (
    rect.width === 0 &&
    rect.height === 0 &&
    window.getComputedStyle(node).getPropertyValue('display') === 'none'
  ) {
    const tmpDisplay = node.style.getPropertyValue('display');
    node.style.setProperty('display', 'block');
    rect = node.getBoundingClientRect();
    node.style.setProperty('display', tmpDisplay);
    _cleanStyle(node);
  }

  return {
    height: rect.height,
    width: rect.width,
    x: rect.x,
    y: rect.y,
  };
}

export function getGeometry(node: HTMLElement | SVGElement): DOMRect {
  return node.getBoundingClientRect();
}

// Whether the element has a box: a hidden one measures as an empty box at the viewport origin
export function hasBox(
  node: HTMLElement | SVGElement,
  geometry: DOMRect,
): boolean {
  return (
    geometry.width !== 0 ||
    geometry.height !== 0 ||
    node.getClientRects().length !== 0
  );
}

/**
 * A 2D transform [a, b, c, d, e, f]. Its linear part [a, b, c, d] maps an offset (x, y) to
 * (a * x + c * y, b * x + d * y); e and f are its translation, which products leave out.
 */
export type Linear = readonly number[];

export const IDENTITY: Linear = [1, 0, 0, 1, 0, 0];

export function multiply(m: Linear, n: Linear): Linear {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
  ];
}

// The offset that m maps to (x, y), or null when m flattens the plane
export function solve(
  m: Linear,
  x: number,
  y: number,
): { x: number; y: number } | null {
  const determinant = m[0] * m[3] - m[1] * m[2];
  if (Math.abs(determinant) < 1e-9) return null;
  return {
    x: (m[3] * x - m[2] * y) / determinant,
    y: (m[0] * y - m[1] * x) / determinant,
  };
}

// A computed transform, which is a matrix or none
export function matrix(value: string | undefined): Linear {
  const match = /^matrix(3d)?\(([^)]*)\)$/.exec(value || '');
  if (match === null) return IDENTITY;
  const v = match[2].split(',').map(Number);
  return match[1] ? [v[0], v[1], v[4], v[5], v[12], v[13]] : v;
}

// The computed rotate property, when it rotates around the z axis. Computed angles are in degrees.
function rotateLinear(value: string | undefined): Linear {
  const match = /^(?:z |0 0 1 )?(-?[\d.e+-]+)deg$/.exec(value || '');
  if (match === null) return IDENTITY;
  const angle = (Number(match[1]) * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [cos, sin, -sin, cos];
}

function scaleLinear(value: string | undefined): Linear {
  if (!value || value === 'none') return IDENTITY;
  const [x, y = x] = value.split(' ').map(Number);
  return Number.isFinite(x) && Number.isFinite(y) ? [x, 0, 0, y] : IDENTITY;
}

/**
 * The linear part of the individual rotate and scale properties, which apply before the transform
 * property, so they also apply to an offset written into the transform.
 */
export function ownLinear(style: CSSStyleDeclaration): Linear {
  return multiply(rotateLinear(style.rotate), scaleLinear(style.scale));
}

/**
 * How the transforms around the children of parent map their offsets to the viewport. For SVG the
 * screen CTM includes the viewBox, the SVG transforms and the CSS transforms of HTML ancestors.
 * The parent may be a shadow root or a document fragment, and the elements around a shadow root
 * are those around its host.
 */
export function parentSpace(parent: Node): Linear {
  let space = IDENTITY;
  for (
    let node: Node | null = parent;
    node !== null;
    node = node.parentNode || (node as ShadowRoot).host || null
  ) {
    if (node.nodeType !== 1) continue;
    if (typeof (node as SVGGraphicsElement).getScreenCTM === 'function') {
      const ctm = (node as SVGGraphicsElement).getScreenCTM();
      return ctm === null
        ? space
        : multiply([ctm.a, ctm.b, ctm.c, ctm.d], space);
    }
    const style = window.getComputedStyle(node as Element);
    space = multiply(
      multiply(ownLinear(style), matrix(style.transform)),
      space,
    );
  }
  return space;
}

/**
 * An inline declaration saved before an animation writes the property, and the value the
 * animation wrote.
 */
export interface SavedStyle {
  property: string;
  value: string;
  priority: string;
  applied: string;
  appliedPriority: string;
}

export function saveStyles(
  style: CSSStyleDeclaration,
  properties: string[],
): SavedStyle[] {
  return properties.map((property) => ({
    property,
    value: style.getPropertyValue(property),
    priority: style.getPropertyPriority(property),
    applied: '',
    appliedPriority: '',
  }));
}

// Records the values the animation has written
export function markApplied(
  style: CSSStyleDeclaration,
  saved: SavedStyle[],
): void {
  for (const entry of saved) {
    entry.applied = style.getPropertyValue(entry.property);
    entry.appliedPriority = style.getPropertyPriority(entry.property);
  }
}

/**
 * Restores the saved declarations and empties saved. A property the application changed after
 * the animation wrote it keeps the application's value.
 */
export function restoreStyles(
  style: CSSStyleDeclaration,
  saved: SavedStyle[],
): void {
  for (const entry of saved) {
    if (
      style.getPropertyValue(entry.property) === entry.applied &&
      style.getPropertyPriority(entry.property) === entry.appliedPriority
    ) {
      if (entry.value)
        style.setProperty(entry.property, entry.value, entry.priority);
      else style.removeProperty(entry.property);
    }
  }
  saved.length = 0;
}

export function setTransform(
  node: HTMLElement | SVGElement,
  x: number,
  y: number,
  scaleX: number = 1,
  scaleY: number = 1,
): void {
  const doScale = scaleX !== 1 || scaleY !== 1;
  if (doScale) {
    node.style.transformOrigin = '0 0';
    node.style.transform = `translate(${x}px,${y}px) scale(${scaleX},${scaleY})`;
  } else {
    node.style.transform = `translate(${x}px,${y}px)`;
  }
}

export function setDimensions(
  node: HTMLElement | SVGElement,
  width: number,
  height: number,
): void {
  node.style.width = width + 'px';
  node.style.height = height + 'px';
}

export function clearDimensions(node: HTMLElement | SVGElement): void {
  node.style.width = node.style.height = '';
}

function _getMaxTransitionDuration(nodes): {
  maxDuration: number;
  nrofTransitions: number;
} {
  let nrofTransitions = 0;
  let maxDuration = 0;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) continue;

    const cs = window.getComputedStyle(node);
    const dur = cs.getPropertyValue('transition-duration').split(',');
    const del = cs.getPropertyValue('transition-delay').split(',');
    const props = cs.getPropertyValue('transition-property').split(',');

    for (const prop of props) {
      const fixedProp = prop.trim();
      if (fixedProp[0] === '-') {
        const tmp = fixedProp.split('-').splice(2).join('-');
        // Since I increase number of transition events to expect by
        // number of durations found I need to remove browser prefix
        // variations of the same property
        if (fixedProp.includes(tmp)) {
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
    nrofTransitions,
  };
}

function setAnimationTimeout(
  onTransitionEnd,
  rootNode,
  maxDuration,
): () => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const start = () => {
    timeout = setTimeout(
      () => onTransitionEnd({ target: rootNode, timeout: true }),
      maxDuration === 0 ? 0 : Math.round(maxDuration * 1000) + 100,
    );
  };
  if (rootNode.nodeName === 'IMG' && !rootNode.complete) {
    rootNode.addEventListener('load', start, { once: true });
  } else {
    start();
  }
  return () => {
    clearTimeout(timeout);
    rootNode.removeEventListener('load', start);
  };
}

/**
 * You need to pass the root element and ALL animated children that have transitions,
 * if there are any,  so the timeout is set to the longest duration. Otherwise there
 * will be animations that fail to complete before the timeout is triggered.
 *
 * @param nodes a list of nodes that have transitions that are part of this animation
 * @param callback callback when all transitions of participating nodes are completed
 * @returns Cancel listeners and the timeout without invoking the callback.
 */
export function registerTransitionListener(
  nodes: Array<HTMLElement | SVGElement>,
  callback: () => void,
): () => void {
  const rootNode = nodes[0];

  /**
   * Here comes the transition event listener
   */
  const transitionDuration = _getMaxTransitionDuration(nodes);
  const maxDuration = transitionDuration.maxDuration;
  let nrofTransitionsLeft = transitionDuration.nrofTransitions;
  let done = false;

  const onTransitionEnd = (event): void => {
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
    cancel();
    if (isFunction(callback)) {
      callback();
    }
  };

  // if element gets removed from the DOM before transition is triggered, browser will raise transitioncancel event
  rootNode.addEventListener('transitioncancel', onTransitionEnd, false);
  rootNode.addEventListener('transitionend', onTransitionEnd, false);

  const cancelTimeout = setAnimationTimeout(
    onTransitionEnd,
    rootNode,
    maxDuration,
  );
  function cancel(): void {
    done = true;
    cancelTimeout();
    rootNode.removeEventListener('transitioncancel', onTransitionEnd, false);
    rootNode.removeEventListener('transitionend', onTransitionEnd, false);
  }
  return cancel;
}
