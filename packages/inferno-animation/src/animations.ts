import {
  addClassName,
  clearDimensions,
  clearTransform,
  forceReflow,
  getDimensions,
  getGeometry,
  registerTransitionListener,
  removeClassName,
  resetDisplay,
  setDimensions,
  setDisplay,
  setTransform,
} from './utils';
import {
  addGlobalAnimationSource,
  AnimationPhase,
  consumeGlobalAnimationSource,
  type GlobalAnimationState,
  scheduleMoveFlush,
  queueAnimation,
} from './animationCoordinator';
import { isNullOrUndef } from 'inferno-shared';
import type { ParentDOM } from 'inferno';
import { installMoveAnimations } from './moveAnimations';

export interface AnimationClass {
  active: string;
  end: string;
  start: string;
}

function getAnimationClass(
  animationProp: AnimationClass | string | undefined | null,
  prefix: string,
): AnimationClass {
  let animCls: AnimationClass;

  if (!isNullOrUndef(animationProp) && typeof animationProp === 'object') {
    animCls = animationProp;
  } else {
    const animationName = animationProp || 'inferno-animation';
    const placeholder = animationName + prefix;
    animCls = {
      active: placeholder + '-active',
      end: placeholder + '-end',
      start: placeholder,
    };
  }

  return animCls;
}

export function componentDidAppear(dom: HTMLElement | SVGElement, props): void {
  entering.add(dom);
  // Get dimensions and unpack class names
  const cls = getAnimationClass(props.animation, '-enter');

  // Moved measuring to pre_initialize. It causes a reflow for each component beacuse of the setDisplay of previous component.
  const dimensions = {};
  const display = setDisplay(dom, 'none');
  const sourceState =
    props.globalAnimationKey === undefined
      ? null
      : consumeGlobalAnimationSource(props.globalAnimationKey);
  queueAnimation((phase: AnimationPhase) => {
    _didAppear(phase, dom, cls, dimensions, display, sourceState);
  }, dom.parentNode);
}

function _getDidAppearTransitionCallback(dom, cls) {
  return () => {
    entering.delete(dom);
    // 5. Remove the element
    clearDimensions(dom);
    removeClassName(dom, cls.active + ' ' + cls.end);
    // 6. Call callback to allow stuff to happen
    // Not currently used but this is where one could
    // add a call to something like this.didAppearDone
  };
}

function _didAppear(
  phase: AnimationPhase,
  dom: HTMLElement | SVGElement,
  cls: AnimationClass,
  dimensions,
  display: string,
  sourceState: GlobalAnimationState | null,
): void {
  switch (phase) {
    case AnimationPhase.INITIALIZE:
      // Needs to be done in a single pass to avoid reflows
      // We set display: none whilst waiting for an animation frame to avoid flicker
      resetDisplay(dom, display);
      return;
    case AnimationPhase.MEASURE:
      // In case of img element that hasn't been loaded, just trigger reflow
      if (dom.tagName !== 'IMG' || (dom as any).complete) {
        const tmp = getDimensions(dom);
        dimensions.x = tmp.x;
        dimensions.y = tmp.y;
        dimensions.width = tmp.width;
        dimensions.height = tmp.height;
      } else {
        forceReflow();
      }
      return;
    case AnimationPhase.SET_START_STATE:
      // 1. Set start of animation
      if (
        !isNullOrUndef(sourceState) &&
        dimensions.width !== 0 &&
        dimensions.height !== 0
      ) {
        // const diffX = (sourceState.width - dimensions.width) / 2;
        // const diffY = (sourceState.height - dimensions.height) / 2;
        const dx = sourceState.x - dimensions.x;
        const dy = sourceState.y - dimensions.y;
        const scaleX = sourceState.width / dimensions.width;
        const scaleY = sourceState.height / dimensions.height;
        setTransform(dom, dx, dy, scaleX, scaleY);
      }
      addClassName(dom, cls.start);
      return;
    case AnimationPhase.ACTIVATE_TRANSITIONS:
      // 2. Activate transition (after a reflow)
      addClassName(dom, cls.active);
      return;
    case AnimationPhase.ACTIVATE_ANIMATION:
      // 4. Activate target state (called async via requestAnimationFrame)
      if (
        !isNullOrUndef(sourceState) &&
        dimensions.width !== 0 &&
        dimensions.height !== 0
      ) {
        clearTransform(dom);
      }
      setDimensions(dom, dimensions.width, dimensions.height);
      removeClassName(dom, cls.start);
      addClassName(dom, cls.end);
      break;
    case AnimationPhase.REGISTER_LISTENERS:
      // Start the timeout after activation; zero-duration transitions must not
      // clean up before the following frame installs the target styles.
      registerTransitionListener(
        [dom],
        _getDidAppearTransitionCallback(dom, cls),
      );
  }
}

export function componentWillDisappear(
  dom: HTMLElement | SVGElement,
  props,
  callback: () => void,
): void {
  leaving.add(dom);
  // Get dimensions and unpack class names
  const cls = getAnimationClass(props.animation, '-leave');
  const dimensions = getDimensions(dom);
  queueAnimation((phase) => {
    _willDisappear(phase, dom, callback, cls, dimensions);
  }, dom.parentNode);
  if (props.globalAnimationKey !== undefined) {
    addGlobalAnimationSource(
      props.globalAnimationKey,
      dimensions as GlobalAnimationState,
    );
    dom.style.setProperty('visibility', 'hidden');
  }
}

function _willDisappear(
  phase: AnimationPhase,
  dom: HTMLElement | SVGElement,
  callback: () => void,
  cls: AnimationClass,
  dimensions,
): void {
  switch (phase) {
    case AnimationPhase.INITIALIZE:
      // Write leave styles before the shared measurement phases.
      // 1. Set animation start state and dimensions
      setDimensions(dom, dimensions.width, dimensions.height);
      addClassName(dom, cls.start);
      return;
    case AnimationPhase.ACTIVATE_TRANSITIONS:
      // 2. Activate transition (after a reflow)
      addClassName(dom, cls.active);
      return;
    case AnimationPhase.ACTIVATE_ANIMATION:
      // 4. Activate target state (called async via requestAnimationFrame)
      addClassName(dom, cls.end);
      removeClassName(dom, cls.start);
      clearDimensions(dom);
      break;
    case AnimationPhase.REGISTER_LISTENERS:
      registerTransitionListener([dom], callback);
  }
}

type AnimatedElement = HTMLElement | SVGElement;
interface TransitionStyle {
  property: string;
  value: string;
  priority: string;
  applied: string;
  appliedPriority: string;
}
interface MoveItem {
  batch: MoveBatch;
  done: boolean;
  node: AnimatedElement;
  x: number;
  y: number;
  dx: number;
  dy: number;
  baseTransform: string;
  transform: string;
  transformPriority: string;
  transitions: TransitionStyle[];
  appliedTransform: string | null;
  initialized: boolean;
  addedClasses: string;
  // No transition can run on the element before the move's classes are added
  instant: boolean;
  // Another item moves the element now
  superseded: boolean;
  previous?: MoveItem;
  ownedTransition?: Animation;
  cancel?: () => void;
}
interface MoveBatch {
  remaining: number;
  parent: Node;
  items: MoveItem[];
  // Source positions of the elements without a running move: they get an item once they move
  nodes: AnimatedElement[];
  xs: number[];
  ys: number[];
  initialized: boolean;
  // The classes of the move's active state, parsed once for all items
  activeClasses: string[];
  // Items that take over an element's running move, and whether any item moved
  retargets: number;
  moved: boolean;
  // Elements with an author transition, when read before measuring
  authors: Set<AnimatedElement> | null;
  cancel?: () => void;
}

const moveBatches = new WeakMap<Node, MoveBatch>();
const moving = new WeakMap<AnimatedElement, MoveItem>();
const entering = new WeakSet<AnimatedElement>();
const leaving = new WeakSet<AnimatedElement>();
const transitionProperties = [
  'transition-property',
  'transition-duration',
  'transition-delay',
  'transition-timing-function',
  'transition-behavior',
];

function parentTransitions(parent: Node): Animation[] {
  // getAnimations may update the document's animation/style state. Query the
  // parent once instead of repeating that work for every sibling.
  return (parent as Element).getAnimations?.({ subtree: true }) || [];
}
function transitionTarget(
  animation: Animation,
  parent: Node,
): AnimatedElement | null {
  const target = (animation.effect as KeyframeEffect | null)?.target;
  return target?.parentNode === parent ? (target as AnimatedElement) : null;
}
function authorTransitions(parent: Node): Set<AnimatedElement> {
  const authors = new Set<AnimatedElement>();
  for (const animation of parentTransitions(parent)) {
    if (
      !('transitionProperty' in animation) ||
      animation.playState === 'finished' ||
      animation.playState === 'idle'
    )
      continue;
    const node = transitionTarget(animation, parent);
    if (node) {
      const item = moving.get(node);
      if (
        animation !== item?.ownedTransition &&
        animation !== item?.previous?.ownedTransition
      )
        authors.add(node);
    }
  }
  return authors;
}

export function componentWillMove(
  _parentVNode,
  parent: ParentDOM,
  _dom: AnimatedElement,
  props: any,
): void {
  if (!parent) return;
  const pending = moveBatches.get(parent);
  // Consecutive synchronous commits share their first visible source positions.
  if (pending && !pending.initialized) return;

  const cls = getAnimationClass(props?.animation, '-move');
  const batch: MoveBatch = {
    parent,
    items: [],
    nodes: [],
    xs: [],
    ys: [],
    initialized: false,
    remaining: 0,
    retargets: 0,
    moved: false,
    authors: null,
    activeClasses: cls.active.split(' ').filter((name) => name !== ''),
  };
  const skipped: MoveItem[] = [];
  const authors = authorTransitions(parent);
  for (
    let child = parent.firstChild;
    child !== null;
    child = child.nextSibling
  ) {
    if (child.nodeType !== 1) continue;
    const node = child as AnimatedElement;
    const previous = moving.get(node);
    if (entering.has(node) || leaving.has(node) || authors.has(node)) {
      if (previous) skipped.push(previous);
      continue;
    }
    const geometry = getGeometry(node);
    if (previous === undefined) {
      batch.nodes.push(node);
      batch.xs.push(geometry.x);
      batch.ys.push(geometry.y);
    } else {
      addMoveItem(batch, node, geometry.x, geometry.y, previous);
      batch.retargets++;
    }
  }
  // Finish skipped old moves only after all new source positions were read.
  for (const item of skipped) finishMove(item);
  if (batch.items.length === 0 && batch.nodes.length === 0) return;
  pending?.cancel?.();
  moveBatches.set(parent, batch);
  batch.cancel = queueAnimation((phase) => runMove(phase, batch), parent);
  scheduleMoveFlush(parent);
}

function addMoveItem(
  batch: MoveBatch,
  node: AnimatedElement,
  x: number,
  y: number,
  previous: MoveItem | undefined,
): MoveItem {
  const item: MoveItem = {
    batch,
    done: false,
    node,
    x,
    y,
    dx: 0,
    dy: 0,
    baseTransform: '',
    transform: '',
    transformPriority: '',
    transitions: [],
    appliedTransform: null,
    initialized: false,
    addedClasses: '',
    instant: false,
    superseded: false,
    previous,
  };
  batch.items.push(item);
  batch.remaining++;
  moving.set(node, item);
  return item;
}

// A computed transition-duration or -delay list of zeros, such as "0s" or "0s, 0ms"
function isZeroTime(value: string): boolean {
  for (const time of value.split(',')) {
    if (parseFloat(time) !== 0) return false;
  }
  return true;
}

function disableTransitions(item: MoveItem): void {
  const style = item.node.style;
  item.transitions = transitionProperties.map((property) => ({
    property,
    value: style.getPropertyValue(property),
    priority: style.getPropertyPriority(property),
    applied: '',
    appliedPriority: '',
  }));
  // Pending-substitution shorthands (and minimal DOM implementations) may not
  // expose longhand values. Preserve that declaration as an indivisible unit.
  if (item.transitions.every((entry) => !entry.value)) {
    item.transitions = [
      {
        property: 'transition',
        value: style.getPropertyValue('transition'),
        priority: style.getPropertyPriority('transition'),
        applied: '',
        appliedPriority: '',
      },
    ];
  }
  // Only displaced elements without an author transition reach this write.
  style.setProperty('transition', 'none', 'important');
  for (const entry of item.transitions) {
    entry.applied = style.getPropertyValue(entry.property);
    entry.appliedPriority = style.getPropertyPriority(entry.property);
  }
}
function restoreTransitions(item: MoveItem): void {
  const style = item.node.style;
  for (const entry of item.transitions) {
    if (
      style.getPropertyValue(entry.property) === entry.applied &&
      style.getPropertyPriority(entry.property) === entry.appliedPriority
    ) {
      if (entry.value)
        style.setProperty(entry.property, entry.value, entry.priority);
      else style.removeProperty(entry.property);
    }
  }
  item.transitions = [];
}
function restoreMoveStyles(item: MoveItem): void {
  item.cancel?.();
  if (item.previous) {
    disposeMove(item.previous);
    item.previous = undefined;
  }
  if (!item.initialized) return;
  const { node } = item;
  if (
    item.appliedTransform !== null &&
    node.style.transform === item.appliedTransform &&
    node.style.getPropertyPriority('transform') === item.transformPriority
  ) {
    if (item.transform)
      node.style.setProperty(
        'transform',
        item.transform,
        item.transformPriority,
      );
    else node.style.removeProperty('transform');
  }
  restoreTransitions(item);
  removeClassName(node, item.addedClasses);
}
function disposeMove(item: MoveItem): void {
  if (item.done) return;
  item.done = true;
  restoreMoveStyles(item);
  if (--item.batch.remaining === 0) {
    item.batch.cancel?.();
    if (moveBatches.get(item.batch.parent) === item.batch)
      moveBatches.delete(item.batch.parent);
  }
}
function finishMove(item: MoveItem): void {
  if (moving.get(item.node) === item) {
    disposeMove(item);
    moving.delete(item.node);
  }
}
function cancelMoves(parent: Node): void {
  const batch = moveBatches.get(parent);
  if (!batch) return;
  batch.cancel?.();
  for (const item of batch.items) finishMove(item);
  moveBatches.delete(parent);
}

function measureMove(item: MoveItem, geometry: DOMRect): void {
  item.dx = item.x - geometry.x;
  item.dy = item.y - geometry.y;
  if (item.dx !== 0 || item.dy !== 0) {
    item.batch.moved = true;
    const style = window.getComputedStyle(item.node);
    const transform = style.transform;
    item.baseTransform = transform === 'none' ? '' : transform;
    item.instant =
      item.transitions.length === 0 &&
      isZeroTime(style.transitionDuration) &&
      isZeroTime(style.transitionDelay);
  }
}

// The elements without a running move that moved get an item
function measureNodes(batch: MoveBatch): void {
  const { nodes, xs, ys } = batch;
  batch.nodes = [];
  batch.xs = [];
  batch.ys = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (
      node.parentNode !== batch.parent ||
      !node.isConnected ||
      entering.has(node) ||
      leaving.has(node) ||
      moving.has(node) ||
      (batch.authors !== null && batch.authors.has(node))
    ) {
      continue;
    }
    const geometry = getGeometry(node);
    if (geometry.x !== xs[i] || geometry.y !== ys[i]) {
      measureMove(addMoveItem(batch, node, xs[i], ys[i], undefined), geometry);
    }
  }
}

function runMove(phase: AnimationPhase, batch: MoveBatch): void {
  if (moveBatches.get(batch.parent) !== batch) return;
  // The first phases belong to enter and leave animations
  if (phase < AnimationPhase.READ_MOVES) {
    if (phase === AnimationPhase.INITIALIZE) batch.initialized = true;
    return;
  }
  // Items that were removed, moved by a newer batch, or started entering or leaving drop out in
  // the first phase of the microtask pass and of activation. The phases after each run
  // synchronously, in which items only finish.
  const verify =
    phase === AnimationPhase.READ_MOVES ||
    phase === AnimationPhase.ACTIVATE_ANIMATION;
  let live = 0;
  // Author transitions exclude an element from the move. Before a running move is reset they are
  // read in READ_MOVES; otherwise once after measuring, and only when something moved.
  let authors: Set<AnimatedElement> | null = null;
  if (phase === AnimationPhase.READ_MOVES) {
    if (batch.retargets !== 0) {
      authors = batch.authors = authorTransitions(batch.parent);
    }
  } else if (
    phase === AnimationPhase.SET_MOVE_START_STATE &&
    batch.authors === null &&
    batch.moved
  ) {
    authors = authorTransitions(batch.parent);
  }
  if (phase === AnimationPhase.REGISTER_LISTENERS) {
    for (const animation of parentTransitions(batch.parent)) {
      if (
        'transitionProperty' in animation &&
        animation.transitionProperty === 'transform'
      ) {
        const node = transitionTarget(animation, batch.parent);
        const item = node && moving.get(node);
        if (item && item.batch === batch) item.ownedTransition = animation;
      }
    }
  }
  for (const item of batch.items) {
    if (item.done || item.superseded) continue;
    const { node } = item;
    if (verify) {
      if (moving.get(node) !== item) {
        item.superseded = true;
        continue;
      }
      if (
        node.parentNode !== batch.parent ||
        !node.isConnected ||
        entering.has(node) ||
        leaving.has(node)
      ) {
        finishMove(item);
        continue;
      }
      live++;
    }
    switch (phase) {
      case AnimationPhase.READ_MOVES:
        // A patch may have started a new author transition since the source read.
        if (authors !== null && authors.has(node)) finishMove(item);
        break;
      case AnimationPhase.RESET_MOVES:
        if (item.previous) {
          // Only our own running transform is interrupted for retargeting.
          item.previous.cancel?.();
          disableTransitions(item);
          disposeMove(item.previous);
          item.previous = undefined;
        }
        break;
      case AnimationPhase.MEASURE_MOVES:
        measureMove(item, getGeometry(node));
        break;
      case AnimationPhase.SET_MOVE_START_STATE:
        if (
          (item.dx === 0 && item.dy === 0) ||
          (authors !== null && authors.has(node))
        ) {
          restoreTransitions(item);
          finishMove(item);
        } else {
          item.transform = node.style.transform;
          item.transformPriority = node.style.getPropertyPriority('transform');
          item.initialized = true;
          // Without a transition the start transform applies at once
          if (!item.transitions.length && !item.instant) {
            disableTransitions(item);
          }
          node.style.setProperty(
            'transform',
            `translate(${item.dx}px,${item.dy}px) ${item.baseTransform}`,
            item.transformPriority,
          );
          item.appliedTransform = node.style.transform;
        }
        break;
      case AnimationPhase.ACTIVATE_TRANSITIONS: {
        restoreTransitions(item);
        let added = '';
        for (const name of batch.activeClasses) {
          if (!node.classList.contains(name)) {
            node.classList.add(name);
            added = added === '' ? name : added + ' ' + name;
          }
        }
        item.addedClasses = added;
        break;
      }
      case AnimationPhase.ACTIVATE_ANIMATION:
        node.style.setProperty(
          'transform',
          item.baseTransform || 'translate(0px,0px)',
          item.transformPriority,
        );
        item.appliedTransform = node.style.transform;
        break;
      case AnimationPhase.REGISTER_LISTENERS:
        item.cancel = registerTransitionListener([node], () =>
          finishMove(item),
        );
        break;
    }
  }
  if (phase === AnimationPhase.MEASURE_MOVES) {
    measureNodes(batch);
    if (batch.remaining === 0) {
      batch.cancel?.();
      moveBatches.delete(batch.parent);
    }
  } else if (verify && live === 0 && batch.nodes.length === 0) {
    batch.cancel?.();
    moveBatches.delete(batch.parent);
  }
}

installMoveAnimations(cancelMoves);
