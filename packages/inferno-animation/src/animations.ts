import { addClassName, clearDimensions, getDimensions, getViewportPosition, insertAfter, insertBefore, registerTransitionListener, removeClassName, setDimensions, setDisplay, resetDisplay, setTransform, clearTransform, removeChild } from './utils';
import { queueAnimation, AnimationPhase } from './animationCoordinator';
import { isNullOrUndef, isNull } from 'inferno-shared';

export type AnimationClass = {
  active: string;
  end: string;
  start: string;
  placeholder: string;
};

function getAnimationClass(animationProp: AnimationClass | string | undefined | null, prefix: string): AnimationClass {
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
      placeholder
    };
  }

  return animCls;
}

export function componentDidAppear(dom: HTMLElement, props) {
  // Get dimensions and unpack class names
  const cls = getAnimationClass(props.animation, '-enter');

  // Moved measuring to pre_initialize. It causes a reflow for each component beacuse of the setDisplay of previous component.
  const dimensions = {};
  const display = setDisplay(dom, 'none');
  queueAnimation((phase) => _didAppear(phase, dom, cls, dimensions, display));
}

function _getDidAppearTransitionCallback(dom, cls) {
  return () => {
    // 5. Remove the element
    clearDimensions(dom);
    removeClassName(dom, cls.active + ' ' + cls.end);
    // 6. Call callback to allow stuff to happen
    // Not currently used but this is where one could
    // add a call to something like this.didAppearDone
  }
}

function _didAppear (phase: AnimationPhase, dom: HTMLElement, cls: AnimationClass, dimensions, display: string) {
  switch (phase) {
    case AnimationPhase.INITIALIZE:
      // Needs to be done in a single pass to avoid reflows
      // We set display: none whilst waiting for an animation frame to avoid flicker
      resetDisplay(dom, display);
      return;
    case AnimationPhase.MEASURE:
      getDimensions(dom);
      return;
    case AnimationPhase.SET_START_STATE:
      // 1. Set start of animation
      addClassName(dom, cls.start);
      return;
    case AnimationPhase.ACTIVATE_TRANSITIONS:
      // 2. Activate transition (after a reflow)
      addClassName(dom, cls.active);
      return;
    case AnimationPhase.REGISTER_LISTENERS:
      // 3. Set an animation listener, code at end
      // Needs to be done after activating so timeout is calculated correctly
      registerTransitionListener(
        // *** Cleanup is broken out as micro optimisation ***
        [dom], _getDidAppearTransitionCallback(dom, cls)
      );
    case AnimationPhase.ACTIVATE_ANIMATION:
      // 4. Activate target state (called async via requestAnimationFrame)
      setDimensions(dom, dimensions.width, dimensions.height);
      removeClassName(dom, cls.start);
      addClassName(dom, cls.end);
      return;
  }
}

export function componentWillDisappear(dom: HTMLElement, props, callback: Function) {
  // Get dimensions and unpack class names
  const cls = getAnimationClass(props.animation, '-leave');
  const dimensions = getDimensions(dom);
  queueAnimation((phase) => _willDisappear(phase, dom, callback, cls, dimensions));
}

function _willDisappear (phase: AnimationPhase, dom: HTMLElement, callback: Function, cls: AnimationClass, dimensions) {
  switch (phase) {
    case AnimationPhase.MEASURE:
      // 1. Get dimensions and set animation start state
      setDimensions(dom, dimensions.width, dimensions.height);
      addClassName(dom, cls.start);
      return;
    case AnimationPhase.ACTIVATE_TRANSITIONS:
      // 2. Activate transition (after a reflow)
      addClassName(dom, cls.active);
      return;
    case AnimationPhase.REGISTER_LISTENERS:
      // 3. Set an animation listener, code at end
      // Needs to be done after activating so timeout is calculated correctly
      registerTransitionListener(
        // Unlike _didAppear, no cleanup needed since node is removed. 
        // Just passing the componentWillDisappear callback so Inferno can
        // remove the nodes.
        [dom], callback
      );
    case AnimationPhase.ACTIVATE_ANIMATION:
      // 4. Activate target state (called async via requestAnimationFrame)
      addClassName(dom, cls.end);
      removeClassName(dom, cls.start);
      clearDimensions(dom);
  }
}

export function componentWillMove(refOrInsance, dom: HTMLElement, parent: HTMLElement, next: HTMLElement, props: any) {
  const cls = getAnimationClass(props.animation, '-move');
  const clsPlaceholder = getAnimationClass(props.animation, '-move-placeholder');
  const { height, width } = getDimensions(dom);
  const { x, y } = getViewportPosition(dom);

  const srcPlaceholder = (isNull(refOrInsance.$TP) ? document.createElement(dom.tagName) : refOrInsance.$TP);
  srcPlaceholder.dataset.placeholder = 'src';
  addClassName(srcPlaceholder, 'placeholder-src');
  const trgPlaceholder = document.createElement(dom.tagName);
  trgPlaceholder.dataset.placeholder = 'trg';
  addClassName(trgPlaceholder, 'placeholder-trg');

  const animState = {
    ref: refOrInsance,
    srcPlaceholder,
    trgPlaceholder,
    srcGeometry: {
      height,
      width,
      x,
      y
    },
    trgGeometry: {
      height: null,
      width: null,
      x: null,
      y: null
    }
  }
  queueAnimation((phase) => _willMove(phase, dom, parent, next, cls, clsPlaceholder, animState));
};


function _willMove (
  phase: AnimationPhase,
  dom: HTMLElement,
  parent: HTMLElement,
  next: HTMLElement,
  cls: AnimationClass,
  clsPlaceholder: AnimationClass,
  animState) {
  const { ref, srcPlaceholder, trgPlaceholder, srcGeometry, trgGeometry } = animState;

  switch (phase) {
    case AnimationPhase.INITIALIZE:
      // 0. If no ref.$TP then a, otherwise b
      //   a. Inject source placeholder
      //   b. Current target placeholder becomes new source placeholder, do nothing
      insertBefore(parent, srcPlaceholder, dom);
      addClassName(srcPlaceholder, clsPlaceholder.placeholder);
      // TODO: Handle case b
      // 1. Move the node to target
      insertBefore(parent, dom, next);
      // TODO: If moving, I should temporarily remove the transform
      return;
    case AnimationPhase.MEASURE:
      // 2. Get geometry of target and store in animState
      const { height, width } = getDimensions(dom);
      const { x, y } = getViewportPosition(dom);
      animState.trgGeometry.height = height;
      animState.trgGeometry.width = width;
      animState.trgGeometry.x = x;
      animState.trgGeometry.y = y;
      return;
    case AnimationPhase.SET_START_STATE:
      // Apply sourece geometry to placeholder
      setDimensions(srcPlaceholder, srcGeometry.width, srcGeometry.height);
      // 3. Inject target placeholder with size 0
      addClassName(trgPlaceholder, clsPlaceholder.placeholder);
      insertAfter(parent, trgPlaceholder, dom);
      // 4. Apply transform to target to place it at start position
      const deltaX = srcGeometry.x - trgGeometry.x;
      const deltaY = srcGeometry.y - trgGeometry.y;
      setTransform(dom,
        deltaX < 0 ? deltaX - srcGeometry.width : deltaX,
        deltaY < 0 ? deltaY - srcGeometry.height : deltaY);
      setDimensions(dom, srcGeometry.width, srcGeometry.height);
      return;
    case AnimationPhase.ACTIVATE_TRANSITIONS:
      // A reflow is triggered prior to this step
      // 5. Activate animation on source placeholder, target placeholder, element
      addClassName(srcPlaceholder, clsPlaceholder.active);
      addClassName(trgPlaceholder, clsPlaceholder.active);
      addClassName(dom, cls.active);
      return;
    case AnimationPhase.REGISTER_LISTENERS:
      // 6. Set an animation listener, code at end
      // Needs to be done after activating so timeout is calculated correctly
      // IMPORTANT! It is up to the animation handler to remove placeholders
      registerTransitionListener(
        [dom], _getWillMoveTransitionCallback(dom, parent, cls, animState)
      );
      return
    case AnimationPhase.ACTIVATE_ANIMATION:
      // 7. Set source placeholder size to 0
      clearDimensions(srcPlaceholder);
      // 8. if ref.$TP then set size of vNode.$TP to 0 to collapse it
      if (!isNull(ref.$TP)) {
        clearDimensions(trgPlaceholder);
        addClassName(trgPlaceholder, cls.placeholder);
      }
      // 9. Apply target dimensions to target placeholder and assign to ref.$TP
      setDimensions(trgPlaceholder, trgGeometry.width, trgGeometry.height);
      ref.$TP = trgPlaceholder;
      // 10. Apply target geometry of node to target
      setTransform(dom, 0, 0);
      setDimensions(dom, trgGeometry.width, trgGeometry.height);
  }
};

function _getWillMoveTransitionCallback(dom: HTMLElement, parent: HTMLElement, cls: AnimationClass, animState) {
  return () => {
    const { ref, srcPlaceholder, trgPlaceholder } = animState;
    // 11. Remove source placeholder element
    removeChild(parent, srcPlaceholder);
    // 12. Remove target placeholder element
    removeChild(parent, trgPlaceholder);
    // 13. if ref.$TP === targetPlaceholder do a otherwise do b
    //     a. we are done, cleanup node and set ref.$TP = null
    //     b. it is still animating so do nothing
    if (ref.$TP === trgPlaceholder) {
      clearDimensions(dom);
      clearTransform(dom);
      removeClassName(dom, cls.active);
      ref.$TP = null;
    }
  }
}
