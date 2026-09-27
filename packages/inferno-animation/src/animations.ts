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
  cls: AnimationClass;
  previous?: MoveItem;
  ownedTransition?: Animation;
  cancel?: () => void;
}
interface MoveBatch {
  remaining: number;
  parent: Node;
  items: MoveItem[];
  initialized: boolean;
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
    initialized: false,
    remaining: 0,
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
    const item: MoveItem = {
      batch,
      done: false,
      node,
      x: geometry.x,
      y: geometry.y,
      dx: 0,
      dy: 0,
      baseTransform: '',
      transform: '',
      transformPriority: '',
      transitions: [],
      appliedTransform: null,
      initialized: false,
      addedClasses: '',
      cls,
      previous,
    };
    batch.items.push(item);
    batch.remaining++;
    moving.set(node, item);
  }
  // Finish skipped old moves only after all new source positions were read.
  for (const item of skipped) finishMove(item);
  if (!batch.items.length) return;
  pending?.cancel?.();
  moveBatches.set(parent, batch);
  batch.cancel = queueAnimation((phase) => runMove(phase, batch), parent);
  scheduleMoveFlush(parent);
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

function runMove(phase: AnimationPhase, batch: MoveBatch): void {
  if (moveBatches.get(batch.parent) !== batch) return;
  if (phase === AnimationPhase.INITIALIZE) batch.initialized = true;
  const authors =
    phase === AnimationPhase.READ_MOVES
      ? authorTransitions(batch.parent)
      : null;
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
    const { node } = item;
    if (moving.get(node) !== item) continue;
    if (
      node.parentNode !== batch.parent ||
      !node.isConnected ||
      entering.has(node) ||
      leaving.has(node)
    ) {
      finishMove(item);
      continue;
    }
    switch (phase) {
      case AnimationPhase.READ_MOVES:
        // A patch may have started a new author transition since the source read.
        if (authors!.has(node)) finishMove(item);
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
      case AnimationPhase.MEASURE_MOVES: {
        const geometry = getGeometry(node);
        item.dx = item.x - geometry.x;
        item.dy = item.y - geometry.y;
        if (item.dx !== 0 || item.dy !== 0) {
          const transform = window.getComputedStyle(node).transform;
          item.baseTransform = transform === 'none' ? '' : transform;
        }
        break;
      }
      case AnimationPhase.SET_MOVE_START_STATE:
        if (item.dx === 0 && item.dy === 0) {
          restoreTransitions(item);
          finishMove(item);
        } else {
          item.transform = node.style.transform;
          item.transformPriority = node.style.getPropertyPriority('transform');
          item.initialized = true;
          if (!item.transitions.length) disableTransitions(item);
          node.style.setProperty(
            'transform',
            `translate(${item.dx}px,${item.dy}px) ${item.baseTransform}`,
            item.transformPriority,
          );
          item.appliedTransform = node.style.transform;
        }
        break;
      case AnimationPhase.ACTIVATE_TRANSITIONS:
        restoreTransitions(item);
        item.addedClasses = item.cls.active
          .split(' ')
          .filter((name) => name !== '' && !node.classList.contains(name))
          .join(' ');
        addClassName(node, item.addedClasses);
        break;
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
  if (!batch.items.some((item) => moving.get(item.node) === item)) {
    batch.cancel?.();
    moveBatches.delete(batch.parent);
  }
}

installMoveAnimations(cancelMoves);
