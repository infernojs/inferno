import {
  addClassName,
  forceReflow,
  getDimensions,
  getGeometry,
  hasBox,
  IDENTITY,
  type Linear,
  markApplied,
  matrix,
  multiply,
  ownLinear,
  parentSpace,
  removeClassName,
  resetDisplay,
  restoreStyles,
  type SavedStyle,
  saveStyles,
  setDimensions,
  setDisplay,
  setTransform,
  solve,
  transitionEntries,
  waitForTransitions,
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
import {
  installMoveAnimations,
  preparedOwnerElements,
  preparedOwnerMayMove,
} from './moveAnimations';

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

type AnimatedElement = HTMLElement | SVGElement;

interface Enter {
  cls: AnimationClass;
  // The inline display that the enter hides until its first phase
  display: string;
  // The enter has started its transitions: until then nothing of the element has been visible
  activated: boolean;
  // A leave has taken over, and the phases that have not run yet do nothing
  cancelled: boolean;
  // Removes the transition listener
  stop?: () => void;
  // The application's inline width and height, and transform and origin of a global animation
  sizes: SavedStyle[];
  transforms: SavedStyle[];
}

interface Leave {
  cls: AnimationClass;
  dimensions: { x: number; y: number; width: number; height: number };
  // Measured with the other leaves once the commit's writes are done
  deferred: boolean;
  // The enter that the leave interrupts, the values that the enter's transitions had reached, and
  // the inline declarations that holding them replaced
  enter: Enter | null;
  // Whether the values the enter reached are read exactly, decided for the leaves of a pass together
  exact: boolean | null;
  reached: Array<[string, string]>;
  held: SavedStyle[];
  // The application's inline width and height
  sizes: SavedStyle[];
  // Keeps the element where its running move has brought it
  hold: Hold | null;
}

// An inline declaration that keeps an element at the offset that its move has reached
interface Hold {
  property: string;
  value: string;
  priority: string;
}

export function componentDidAppear(dom: AnimatedElement, props): void {
  // Get dimensions and unpack class names
  const cls = getAnimationClass(props.animation, '-enter');

  // Moved measuring to pre_initialize. It causes a reflow for each component beacuse of the setDisplay of previous component.
  const dimensions = {};
  const enter: Enter = {
    cls,
    display: setDisplay(dom, 'none'),
    activated: false,
    cancelled: false,
    sizes: [],
    transforms: [],
  };
  entering.set(dom, enter);
  const sourceState =
    props.globalAnimationKey === undefined
      ? null
      : consumeGlobalAnimationSource(props.globalAnimationKey);
  queueAnimation((phase: AnimationPhase) => {
    if (!enter.cancelled) {
      _didAppear(phase, dom, enter, dimensions, sourceState);
    }
  }, dom.parentNode);
}

function _finishEnter(dom: AnimatedElement, enter: Enter): void {
  entering.delete(dom);
  // 5. Restore the application's width and height
  restoreStyles(dom.style, enter.sizes);
  removeClassName(dom, enter.cls.active + ' ' + enter.cls.end);
  // 6. Call callback to allow stuff to happen
  // Not currently used but this is where one could
  // add a call to something like this.didAppearDone
}

function _didAppear(
  phase: AnimationPhase,
  dom: AnimatedElement,
  enter: Enter,
  dimensions,
  sourceState: GlobalAnimationState | null,
): void {
  const cls = enter.cls;
  const fromSource =
    !isNullOrUndef(sourceState) &&
    dimensions.width !== 0 &&
    dimensions.height !== 0;
  switch (phase) {
    case AnimationPhase.INITIALIZE:
      // Needs to be done in a single pass to avoid reflows
      // We set display: none whilst waiting for an animation frame to avoid flicker
      resetDisplay(dom, enter.display);
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
      if (fromSource) {
        // const diffX = (sourceState.width - dimensions.width) / 2;
        // const diffY = (sourceState.height - dimensions.height) / 2;
        const dx = sourceState.x - dimensions.x;
        const dy = sourceState.y - dimensions.y;
        const scaleX = sourceState.width / dimensions.width;
        const scaleY = sourceState.height / dimensions.height;
        enter.transforms = saveStyles(dom.style, [
          'transform',
          'transform-origin',
        ]);
        setTransform(dom, dx, dy, scaleX, scaleY);
        markApplied(dom.style, enter.transforms);
      }
      addClassName(dom, cls.start);
      return;
    case AnimationPhase.ACTIVATE_TRANSITIONS:
      // 2. Activate transition (after a reflow)
      addClassName(dom, cls.active);
      return;
    case AnimationPhase.ACTIVATE_ANIMATION:
      // 4. Activate target state (called async via requestAnimationFrame)
      enter.activated = true;
      // A global animation transitions to the application's transform
      restoreStyles(dom.style, enter.transforms);
      enter.sizes = saveStyles(dom.style, ['width', 'height']);
      setDimensions(dom, dimensions.width, dimensions.height);
      markApplied(dom.style, enter.sizes);
      removeClassName(dom, cls.start);
      addClassName(dom, cls.end);
      break;
    case AnimationPhase.REGISTER_LISTENERS:
      // Start the timeout after activation; zero-duration transitions must not
      // clean up before the following frame installs the target styles.
      enter.stop = waitForTransitions(dom, () => _finishEnter(dom, enter));
  }
}

// Leaves that interrupt an enter and have not been measured. The first of them that is measured
// decides for all: an element's own animation query sorts every animation of the document, so the
// exact query is used only for a few of them.
let interrupting: Leave[] = [];
const EXACT_INTERRUPTS = 16;

// Longhands of the shorthands a transition list may name
const LONGHANDS: Record<string, string[]> = {
  margin: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
  padding: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
  inset: ['top', 'right', 'bottom', 'left'],
  'border-width': [
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
  ],
  'border-color': [
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
  ],
  'border-radius': [
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
  ],
};
// What a transition of all holds when the enter's own transitions are not queried: the properties
// that enter and leave animations commonly transition, those of index.css included
const TRANSITIONED_BY_ALL = [
  'opacity',
  'transform',
  'translate',
  'scale',
  'rotate',
  'filter',
  'clip-path',
  'box-shadow',
  'color',
  'background-color',
  'max-width',
  'max-height',
  'min-width',
  'min-height',
  ...LONGHANDS.inset,
  ...LONGHANDS.margin,
  ...LONGHANDS.padding,
  ...LONGHANDS['border-width'],
];

// The values that the running transitions of dom have reached, except its width and height. The
// properties come from the computed transition lists; a list with all asks the element's own
// animations when exact, and holds the common properties otherwise. Holding a property that
// does not transition keeps its current value, as it would be anyway.
function reachedValues(
  dom: AnimatedElement,
  exact: boolean,
): Array<[string, string]> {
  const style = window.getComputedStyle(dom);
  const entries = transitionEntries(style);
  if (entries === null) return [];
  const properties: string[] = [];
  for (const [name] of entries) {
    if (name === 'all') {
      if (exact) return animatedValues(dom, style);
      properties.push(...TRANSITIONED_BY_ALL);
    } else {
      properties.push(...(LONGHANDS[name] ?? [name]));
    }
  }
  const reached: Array<[string, string]> = [];
  for (const property of properties) {
    if (property === 'width' || property === 'height') continue;
    const value = style.getPropertyValue(property);
    if (value) reached.push([property, value]);
  }
  return reached;
}

// The values that the running transitions of dom have reached, from its own animations
function animatedValues(
  dom: AnimatedElement,
  style: CSSStyleDeclaration,
): Array<[string, string]> {
  const reached: Array<[string, string]> = [];
  for (const animation of dom.getAnimations?.() || []) {
    if (
      'transitionProperty' in animation &&
      (animation.playState === 'running' || animation.playState === 'paused')
    ) {
      const property = (animation as CSSTransition).transitionProperty;
      if (property !== 'width' && property !== 'height') {
        reached.push([property, style.getPropertyValue(property)]);
      }
    }
  }
  return reached;
}

// The leave takes over from the enter it interrupts: the element keeps the values that the enter's
// transitions have reached, until the leave activates its own. Removing the enter's classes
// cancels those transitions within this animation pass, before the leave listens for transitions.
function _interruptEnter(dom: AnimatedElement, leave: Leave): void {
  const enter = leave.enter!;
  const style = dom.style;
  removeClassName(
    dom,
    enter.cls.start + ' ' + enter.cls.active + ' ' + enter.cls.end,
  );
  restoreStyles(style, enter.transforms);
  restoreStyles(style, enter.sizes);
  leave.held = saveStyles(
    style,
    leave.reached.map(([property]) => property),
  );
  for (const [property, value] of leave.reached) {
    style.setProperty(property, value);
  }
  markApplied(style, leave.held);
}

export function componentWillDisappear(
  dom: AnimatedElement,
  props,
  callback: () => void,
): void {
  const enter = entering.get(dom);
  if (enter !== undefined) {
    entering.delete(dom);
    enter.cancelled = true;
    enter.stop?.();
    // Nothing of the element has been visible, so there is nothing to animate
    if (!enter.activated) {
      callback();
      return;
    }
  }
  leaving.add(dom);
  // A move that ended with its list in this commit
  const hold = released.get(dom);
  if (hold !== undefined) {
    released.delete(dom);
    holdOffset(dom, hold);
  }
  // A leave is measured with the others once the commit's writes are done: a read between them
  // would lay the document out again for every leaving element. A global animation hands its
  // source to an element that may enter in another pass, so it is measured now.
  const deferred = props.globalAnimationKey === undefined;
  const leave: Leave = {
    cls: getAnimationClass(props.animation, '-leave'),
    dimensions: deferred
      ? { x: 0, y: 0, width: 0, height: 0 }
      : getDimensions(dom),
    deferred,
    enter: enter ?? null,
    exact: null,
    reached: [],
    held: [],
    sizes: [],
    hold: null,
  };
  if (enter !== undefined) interrupting.push(leave);
  queueAnimation((phase) => {
    _willDisappear(phase, dom, callback, leave);
  }, dom.parentNode);
  if (!deferred) {
    addGlobalAnimationSource(
      props.globalAnimationKey,
      leave.dimensions as GlobalAnimationState,
    );
    dom.style.setProperty('visibility', 'hidden');
  }
}

function _willDisappear(
  phase: AnimationPhase,
  dom: AnimatedElement,
  callback: () => void,
  leave: Leave,
): void {
  const { cls, dimensions } = leave;
  const style = dom.style;
  const move = moving.get(dom);
  switch (phase) {
    case AnimationPhase.MEASURE_LEAVES:
      if (leave.deferred) {
        const measured = getDimensions(dom);
        dimensions.x = measured.x;
        dimensions.y = measured.y;
        dimensions.width = measured.width;
        dimensions.height = measured.height;
      }
      if (leave.enter !== null) {
        if (leave.exact === null) {
          const leaves = interrupting;
          interrupting = [];
          const exact = leaves.length <= EXACT_INTERRUPTS;
          for (const other of leaves) other.exact = exact;
        }
        leave.reached = reachedValues(dom, leave.exact ?? true);
      }
      if (move !== undefined) leave.hold = reachedOffset(move);
      return;
    case AnimationPhase.INITIALIZE:
      // The element stays where its move has brought it
      if (move !== undefined) {
        finishMove(move);
        if (leave.hold !== null) holdOffset(dom, leave.hold);
      }
      if (leave.enter !== null) _interruptEnter(dom, leave);
      // Write leave styles before the shared measurement phases.
      // 1. Set animation start state and dimensions
      leave.sizes = saveStyles(style, ['width', 'height']);
      setDimensions(dom, dimensions.width, dimensions.height);
      markApplied(style, leave.sizes);
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
      restoreStyles(style, leave.sizes);
      restoreStyles(style, leave.held);
      break;
    case AnimationPhase.REGISTER_LISTENERS:
      waitForTransitions(dom, callback);
  }
}

interface MoveItem {
  batch: MoveBatch;
  done: boolean;
  node: AnimatedElement;
  // The source position, and the offset from the target to it, in viewport pixels
  x: number;
  y: number;
  dx: number;
  dy: number;
  // The element's own rotate and scale, which apply to an offset in its transform
  linear: Linear;
  // Carries the offset: transform, or translate while a keyframe animation sets the transform
  property: 'transform' | 'translate';
  // A CSS animation runs on the element, or has filled forwards
  keyframed: boolean;
  baseTransform: string;
  // The element's own translate property; an offset in translate would replace it
  translate: string;
  // The inline declaration of property, and the value that the move wrote
  offset: SavedStyle[];
  transitions: SavedStyle[];
  // Declarations that the move replaces while it runs
  overrides: SavedStyle[];
  initialized: boolean;
  addedClasses: string;
  // Starts with an offset in the current animation pass, which carries the moves inside it along
  starting: boolean;
  // The transitions that the element's computed transition lists can run before the move's
  // classes are added, or null when the lists can't be read
  runnable: Array<[string, number]> | null;
  // Another item moves the element now
  superseded: boolean;
  previous?: MoveItem;
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
  // Siblings share measurements; owners with another animation keep their own classes.
  animation: AnimationClass | string | undefined | null;
  activeClasses: string[];
  ownerClasses: Map<AnimatedElement, string[]> | null;
  // Items that take over an element's running move, and whether any item moved
  retargets: number;
  moved: boolean;
  // Elements with an author transition, when read
  authors: Set<AnimatedElement> | null;
  // Elements whose transform a script animation sets, when read with the parent's animations
  scripted: Set<AnimatedElement> | null;
  // Some measured element can run an author transition, so they are read after measuring
  mayHaveAuthors: boolean;
  // How the transforms around the parent map offsets to the viewport, once something moves
  space: Linear | null;
  cancel?: () => void;
}

const moveBatches = new WeakMap<Node, MoveBatch>();
const moving = new WeakMap<AnimatedElement, MoveItem>();
const entering = new WeakMap<AnimatedElement, Enter>();
const leaving = new WeakSet<AnimatedElement>();
// The offsets of the moves that ended with their list in the current task: the leaves of their
// elements, which the commit starts after it has unmounted the list, hold them
const released = new Map<AnimatedElement, Hold>();
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
// Whether a script animation sets the transform of node; an animation that has finished sets it
// while it fills forwards. An element without animations answers its own query without a
// document-wide one, but a retargeted element still has the move transition that RESET_MOVES has
// just cancelled: in a batch with retargets, one query of the parent answers for every item.
function scriptAnimatesTransform(
  batch: MoveBatch,
  node: AnimatedElement,
): boolean {
  if (batch.retargets !== 0) {
    if (batch.scripted === null) readChildAnimations(batch, false);
    return batch.scripted!.has(node);
  }
  for (const animation of node.getAnimations?.() || []) {
    if (!('transitionProperty' in animation) && setsTransform(animation))
      return true;
  }
  return false;
}
function setsTransform(animation: Animation): boolean {
  const effect = animation.effect as KeyframeEffect | null;
  return (
    effect?.getKeyframes?.().some((keyframe) => 'transform' in keyframe) ===
    true
  );
}
// A computed animation-name list with an animation in it
function hasAnimationName(names: string | undefined): boolean {
  if (!names) return false;
  for (const name of names.split(',')) {
    const trimmed = name.trim();
    if (trimmed !== '' && trimmed !== 'none') return true;
  }
  return false;
}
// Reads the children of the batch's parent that run an author transition, when authors is set,
// and those whose transform a script animation sets (not one of a pseudo-element, as the
// element's own query). An element whose running move is retargeted transitions that move's
// property only for it: an element has one transition per property. A move that has not started
// runs no transition.
function readChildAnimations(batch: MoveBatch, authors: boolean): void {
  const parent = batch.parent;
  const found = new Set<AnimatedElement>();
  const scripted = new Set<AnimatedElement>();
  for (const animation of parentTransitions(parent)) {
    const node = transitionTarget(animation, parent);
    if (node === null) continue;
    if (!('transitionProperty' in animation)) {
      if (
        !scripted.has(node) &&
        !(animation.effect as KeyframeEffect).pseudoElement &&
        setsTransform(animation)
      )
        scripted.add(node);
      continue;
    }
    const property = (animation as CSSTransition).transitionProperty;
    const item = moving.get(node);
    if (
      animation.playState !== 'finished' &&
      animation.playState !== 'idle' &&
      property !== item?.previous?.property
    )
      found.add(node);
  }
  if (authors) batch.authors = found;
  batch.scripted = scripted;
}
// Whether the runnable transitions include one that is not of the property own: without any
// runnable transition no author transition can run (a transition runs only while its property is
// listed with a positive combined duration). Unknown lists may run one.
function mayRunOther(
  runnable: Array<[string, number]> | null,
  own: string | null,
): boolean {
  if (runnable === null) return true;
  for (const [name] of runnable) {
    if (name !== own && name !== '-webkit-' + own) return true;
  }
  return false;
}
// Whether the runnable transitions can transition property
function mayTransition(
  runnable: Array<[string, number]> | null,
  property: string,
): boolean {
  if (runnable === null) return true;
  for (const [name] of runnable) {
    if (name === property || name === 'all' || name === '-webkit-' + property)
      return true;
  }
  return false;
}

// How far the patch in progress has shifted the children of parent. Their list is patched after
// the items before it in the list around it, whose removal shifts it. The shift is that of the
// nearest element around them whose position was read before the patch.
function sourceDrift(parent: Node): { x: number; y: number } | null {
  for (
    let node = parent, outer = node.parentNode;
    outer !== null;
    node = outer, outer = node.parentNode
  ) {
    const batch = moveBatches.get(outer);
    if (batch !== undefined && !batch.initialized) {
      const item = moving.get(node as AnimatedElement);
      const index = batch.nodes.indexOf(node as AnimatedElement);
      const retargeted = item !== undefined && item.batch === batch;
      if (!retargeted && index === -1) return null;
      const geometry = getGeometry(node as AnimatedElement);
      return {
        x: geometry.x - (retargeted ? item.x : batch.xs[index]),
        y: geometry.y - (retargeted ? item.y : batch.ys[index]),
      };
    }
  }
  return null;
}

export function componentWillMove(
  _parentVNode,
  parent: ParentDOM,
  dom: AnimatedElement,
  props: any,
): void {
  // A list that keeps its keys in order moves nothing, and a running move keeps going. A later
  // commit of the same task that moves something reads the sources then.
  if (!parent || !preparedOwnerMayMove()) return;
  const pending = moveBatches.get(parent);
  const animation = props?.animation;
  // Consecutive synchronous commits share their first visible source positions.
  if (pending && !pending.initialized) {
    const sameAnimation = animation === pending.animation;
    if (sameAnimation && pending.ownerClasses === null) return;
    const classes = sameAnimation
      ? pending.activeClasses
      : getAnimationClass(animation, '-move')
          .active.split(' ')
          .filter((name) => name !== '');
    const ownerClasses = (pending.ownerClasses ??= new Map());
    const elements = preparedOwnerElements();
    if (elements === null) {
      ownerClasses.set(dom, classes);
    } else {
      for (const element of elements)
        ownerClasses.set(element as AnimatedElement, classes);
    }
    return;
  }

  const cls = getAnimationClass(animation, '-move');
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
    scripted: null,
    mayHaveAuthors: false,
    space: null,
    animation,
    activeClasses: cls.active.split(' ').filter((name) => name !== ''),
    ownerClasses: null,
  };
  const skipped: MoveItem[] = [];
  for (
    let child = parent.firstChild;
    child !== null;
    child = child.nextSibling
  ) {
    if (child.nodeType !== 1) continue;
    const node = child as AnimatedElement;
    const previous = moving.get(node);
    if (leaving.has(node)) continue; // Its leave ends its move
    if (entering.has(node)) {
      if (previous) skipped.push(previous);
      continue;
    }
    const geometry = getGeometry(node);
    // A hidden element has no source position
    if (!hasBox(node, geometry)) {
      if (previous) skipped.push(previous);
    } else if (previous === undefined) {
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
  const drift = sourceDrift(parent);
  if (drift !== null) {
    for (let i = 0; i < batch.xs.length; i++) {
      batch.xs[i] -= drift.x;
      batch.ys[i] -= drift.y;
    }
    for (const item of batch.items) {
      item.x -= drift.x;
      item.y -= drift.y;
    }
  }
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
    linear: IDENTITY,
    property: 'transform',
    keyframed: false,
    baseTransform: '',
    translate: 'none',
    offset: [],
    transitions: [],
    overrides: [],
    initialized: false,
    addedClasses: '',
    starting: false,
    runnable: null,
    superseded: false,
    previous,
  };
  batch.items.push(item);
  batch.remaining++;
  moving.set(node, item);
  return item;
}

function disableTransitions(item: MoveItem): void {
  const style = item.node.style;
  if (style.length === 0) {
    // No inline declaration to keep: cleanup removes the shorthand
    item.transitions = saveStyles(style, ['transition']);
  } else {
    item.transitions = saveStyles(style, transitionProperties);
    // A declaration that the shorthand serializes is written back as it was read: longhands
    // written one by one make the values it left out explicit, which older WebKit then includes in
    // the shorthand. Pending-substitution shorthands (and minimal DOM implementations) may not
    // expose longhand values. Either way the declaration is preserved as an indivisible unit.
    if (
      style.getPropertyValue('transition') ||
      item.transitions.every((entry) => !entry.value)
    ) {
      item.transitions = saveStyles(style, ['transition']);
    }
  }
  // Only displaced elements without an author transition reach this write.
  style.setProperty('transition', 'none', 'important');
  markApplied(style, item.transitions, 'important');
}
function restoreTransitions(item: MoveItem): void {
  restoreStyles(item.node.style, item.transitions);
}
// Writes the offset and records it, so that cleanup restores only a value the move wrote
function writeOffset(item: MoveItem, value: string): void {
  const style = item.node.style;
  const saved = item.offset[0];
  style.setProperty(saved.property, value, saved.priority);
  markApplied(style, item.offset, saved.priority);
}
function restoreMoveStyles(item: MoveItem): void {
  item.cancel?.();
  if (item.previous) {
    disposeMove(item.previous);
    item.previous = undefined;
  }
  if (!item.initialized) return;
  const style = item.node.style;
  restoreStyles(style, item.offset);
  restoreStyles(style, item.overrides);
  restoreTransitions(item);
  removeClassName(item.node, item.addedClasses);
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
// The declaration that keeps the element of item at the offset that its running move has reached.
// An offset in the transform is held in translate where possible, so that the leave can animate
// the transform; the element's own rotate and scale apply to the one but not to the other.
function reachedOffset(item: MoveItem): Hold | null {
  const running = item.initialized ? item : item.previous;
  if (running === undefined || !running.initialized) return null;
  const { node, property, linear } = running;
  const reached = window.getComputedStyle(node).getPropertyValue(property);
  if (!reached || reached === 'none') return null;
  if (
    property === 'transform' &&
    running.translate === 'none' &&
    'translate' in node.style
  ) {
    const to = matrix(reached);
    const from = matrix(running.baseTransform);
    const x = to[4] - from[4];
    const y = to[5] - from[5];
    return {
      property: 'translate',
      value: `${linear[0] * x + linear[2] * y}px ${linear[1] * x + linear[3] * y}px`,
      priority: '',
    };
  }
  return { property, value: reached, priority: running.offset[0].priority };
}
function holdOffset(node: AnimatedElement, hold: Hold): void {
  node.style.setProperty(hold.property, hold.value, hold.priority);
}
function isCurrent(item: MoveItem): boolean {
  return !item.done && moving.get(item.node) === item;
}
function isLeaving(item: MoveItem): boolean {
  return isCurrent(item) && leaving.has(item.node);
}
// Finishes the moves of elements that leave, or that may leave in this commit: they stay where the
// moves have brought them. Every offset is read before the first move is finished.
function finishHeld(items: MoveItem[]): void {
  const holds = items.map(reachedOffset);
  for (let i = 0; i < items.length; i++) {
    const node = items[i].node;
    const hold = holds[i];
    finishMove(items[i]);
    if (hold === null) continue;
    if (leaving.has(node)) {
      holdOffset(node, hold);
    } else {
      if (released.size === 0) {
        queueMicrotask(() => {
          released.clear();
        });
      }
      released.set(node, hold);
    }
  }
}
function cancelMoves(parent: Node): void {
  const batch = moveBatches.get(parent);
  if (!batch) return;
  batch.cancel?.();
  finishHeld(batch.items.filter(isCurrent));
  moveBatches.delete(parent);
}

// An item moves when its element is displaced, or when an element around it starts a move that
// carries it along (carried): an element that ends where it was moves against that one
function measureMove(
  item: MoveItem,
  geometry: DOMRect,
  carried: boolean,
): void {
  // A hidden element has no target position
  if (!hasBox(item.node, geometry)) {
    item.dx = item.dy = 0;
    return;
  }
  item.dx = item.x - geometry.x;
  item.dy = item.y - geometry.y;
  if (item.dx !== 0 || item.dy !== 0 || carried) {
    item.starting = true;
    item.batch.moved = true;
    const style = window.getComputedStyle(item.node);
    const transform = style.transform;
    item.baseTransform = transform === 'none' ? '' : transform;
    item.translate = style.translate || 'none';
    item.keyframed = hasAnimationName(style.animationName);
    item.linear = ownLinear(style);
    item.runnable = transitionEntries(style);
    // Before its move starts, any transition of the element is an author's; a retargeted item's
    // lists are read before its running move is reset
    if (item.transitions.length === 0 && mayRunOther(item.runnable, null))
      item.batch.mayHaveAuthors = true;
  }
}

// The elements without a running move that moved get an item
function measureNodes(batch: MoveBatch, carried: boolean): void {
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
    if (
      (carried || geometry.x !== xs[i] || geometry.y !== ys[i]) &&
      hasBox(node, geometry)
    ) {
      measureMove(
        addMoveItem(batch, node, xs[i], ys[i], undefined),
        geometry,
        carried,
      );
    }
  }
}

// The nearest element around parent that starts a move in this animation pass
function startingAncestor(parent: Node): MoveItem | null {
  for (let node: Node | null = parent; node !== null; node = node.parentNode) {
    const item = moving.get(node as AnimatedElement);
    if (item !== undefined && item.starting && !item.done) return item;
  }
  return null;
}

// Writes the start state of an item that moves, or finishes it when its offset disappears
function startMove(item: MoveItem, outer: MoveItem | null): void {
  const { node, batch } = item;
  // A moving ancestor carries the item along with its own offset
  const dx = outer === null ? item.dx : item.dx - outer.dx;
  const dy = outer === null ? item.dy : item.dy - outer.dy;
  // The offset in the element's coordinates. Its own rotate and scale apply to an offset in its
  // transform, but not to one in translate, which applies before them.
  const offset = solve(
    item.property === 'translate'
      ? batch.space!
      : multiply(batch.space!, item.linear),
    dx,
    dy,
  );
  if (
    offset === null ||
    (Math.abs(offset.x) < 0.01 && Math.abs(offset.y) < 0.01)
  ) {
    restoreTransitions(item);
    finishMove(item);
    return;
  }
  item.offset = saveStyles(node.style, [item.property]);
  item.initialized = true;
  // Without a transition the start offset applies at once
  // Without a transition of the move's property the start offset applies at once
  if (!item.transitions.length && mayTransition(item.runnable, item.property)) {
    disableTransitions(item);
  }
  writeOffset(
    item,
    item.property === 'translate'
      ? `${offset.x}px ${offset.y}px`
      : `translate(${offset.x}px,${offset.y}px) ${item.baseTransform}`,
  );
}

// The move classes transition the transform, which the keyframe animation sets: the move's
// transition applies to translate instead
function transitionTranslate(item: MoveItem): void {
  const style = item.node.style;
  const properties = window.getComputedStyle(item.node).transitionProperty;
  const list = properties.split(',').map((name) => name.trim());
  if (!list.includes('transform')) return;
  item.overrides = saveStyles(style, ['transition-property']);
  style.setProperty(
    'transition-property',
    list.map((name) => (name === 'transform' ? 'translate' : name)).join(', '),
    'important',
  );
  markApplied(style, item.overrides, 'important');
}

// Whether a retargeted item can run a transition besides its running move
function retargetsMayHaveAuthors(batch: MoveBatch): boolean {
  let may = false;
  for (const item of batch.items) {
    const previous = item.previous;
    if (item.done || previous === undefined || moving.get(item.node) !== item)
      continue;
    const runnable = transitionEntries(window.getComputedStyle(item.node));
    if (mayRunOther(runnable, previous.property)) may = true;
  }
  return may;
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
  // Author transitions exclude an element from the move, and a keyframe animation of its transform
  // moves it with translate. Before a running move is reset they are read in READ_MOVES;
  // otherwise once after measuring, and only when something moved.
  if (phase === AnimationPhase.READ_MOVES) {
    // The reads also bring the style up to date after the patch, before RESET_MOVES writes
    if (batch.retargets !== 0 && retargetsMayHaveAuthors(batch))
      readChildAnimations(batch, true);
  } else if (
    phase === AnimationPhase.SELECT_MOVES &&
    batch.authors === null &&
    batch.moved &&
    batch.mayHaveAuthors
  ) {
    readChildAnimations(batch, true);
  }
  // Nested moves subtract the offset of the element around them that carries them. The elements
  // that start a move are known once they are measured, and those that an author transition
  // excludes have dropped out when every batch of the pass has completed SELECT_MOVES.
  const outer =
    phase === AnimationPhase.MEASURE_MOVES ||
    phase === AnimationPhase.SET_MOVE_START_STATE
      ? startingAncestor(batch.parent)
      : null;
  if (verify) {
    const leavers = batch.items.filter(isLeaving);
    if (leavers.length !== 0) finishHeld(leavers);
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
        entering.has(node)
      ) {
        finishMove(item);
        continue;
      }
      live++;
    }
    switch (phase) {
      case AnimationPhase.READ_MOVES:
        // A patch may have started a new author transition since the source read.
        if (batch.authors !== null && batch.authors.has(node)) finishMove(item);
        break;
      case AnimationPhase.RESET_MOVES:
        if (item.previous) {
          // Only our own running move is interrupted for retargeting.
          item.previous.cancel?.();
          restoreStyles(node.style, item.previous.overrides);
          disableTransitions(item);
          disposeMove(item.previous);
          item.previous = undefined;
        }
        break;
      case AnimationPhase.MEASURE_MOVES:
        measureMove(item, getGeometry(node), outer !== null);
        break;
      case AnimationPhase.SELECT_MOVES:
        if (
          !item.starting ||
          (batch.authors !== null && batch.authors.has(node))
        ) {
          restoreTransitions(item);
          finishMove(item);
        } else if (
          // An offset in translate would replace the element's own translate. A CSS animation is
          // known from the computed style; a script animation is asked for only without one.
          item.translate === 'none' &&
          'translate' in node.style &&
          (item.keyframed || scriptAnimatesTransform(batch, node))
        ) {
          item.property = 'translate';
        }
        break;
      case AnimationPhase.SET_MOVE_START_STATE:
        startMove(item, outer);
        break;
      case AnimationPhase.ACTIVATE_TRANSITIONS: {
        item.starting = false;
        restoreTransitions(item);
        let added = '';
        for (const name of batch.ownerClasses?.get(node) ??
          batch.activeClasses) {
          if (!node.classList.contains(name)) {
            node.classList.add(name);
            added = added === '' ? name : added + ' ' + name;
          }
        }
        item.addedClasses = added;
        if (item.property === 'translate') transitionTranslate(item);
        break;
      }
      case AnimationPhase.ACTIVATE_ANIMATION:
        writeOffset(
          item,
          item.property === 'translate'
            ? '0px 0px'
            : item.baseTransform || 'translate(0px,0px)',
        );
        break;
      case AnimationPhase.REGISTER_LISTENERS:
        item.cancel = waitForTransitions(node, () => finishMove(item));
        break;
    }
  }
  if (phase === AnimationPhase.MEASURE_MOVES) {
    measureNodes(batch, outer !== null);
    // Read with the measurements, before any move of the pass writes its start state
    if (batch.moved) batch.space = parentSpace(batch.parent);
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
