import { addClassName, clearDimensions, getDimensions, getOffsetPosition, insertAfter, insertBefore, insertDebugMarker, registerTransitionListener, removeClassName, setDimensions, setDisplay, resetDisplay, setTransform, clearTransform, removeChild } from './utils';
import { queueAnimation, AnimationPhase } from './animationCoordinator';
import { isNullOrUndef, isNull } from 'inferno-shared';

// Show debug output and debugging markers during developmen of move animations
const _DBG_MVE_ = false && process.env.NODE_ENV !== 'production';

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
  const isFirstMove = isNull(refOrInsance.$TP);

  // Source marker
  if (_DBG_MVE_) insertDebugMarker(parent, dom, 'src', dom.innerText);

  // Create placeholders
  const clsPlaceholder = getAnimationClass(props.animation, '-move-placeholder');

  const srcPlaceholder = (isFirstMove ? document.createElement(dom.tagName) : refOrInsance.$TP);
  srcPlaceholder.dataset.placeholder = 'src';
  if (_DBG_MVE_) (srcPlaceholder.innerHTML = dom.innerHTML);
  if (isFirstMove) addClassName(srcPlaceholder, 'placeholder-src');

  const trgPlaceholder = document.createElement(dom.tagName);
  trgPlaceholder.dataset.placeholder = 'trg';
  if (_DBG_MVE_) (trgPlaceholder.innerHTML = dom.innerHTML);
  addClassName(trgPlaceholder, 'placeholder-trg');

  if (_DBG_MVE_) console.log('Animating move', dom)

  // Measure source geometry of node being moved
  const cls = getAnimationClass(props.animation, '-move');
  const { height, width } = getDimensions(dom);
  const { x, y } = getOffsetPosition(dom);

  const animState = {
    isFirstMove,
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
  const { isFirstMove, ref, srcPlaceholder, trgPlaceholder, srcGeometry, trgGeometry } = animState;

  switch (phase) {
    case AnimationPhase.INITIALIZE:
      // 0. If no ref.$TP then a, otherwise b
      //   a. Inject source placeholder (has size 0 at this point)
      //   b. Current target placeholder becomes new source placeholder, do nothing
      // TODO: Implement case b
      if (isFirstMove) {
        if (_DBG_MVE_) console.log('isFirstMove');
        addClassName(srcPlaceholder, clsPlaceholder.placeholder);
        insertBefore(parent, srcPlaceholder, dom);
      }

      // 1. Move the node to target
      insertBefore(parent, dom, next);

      // 2. Inject target placeholder (has size 0 at this point)
      addClassName(trgPlaceholder, clsPlaceholder.placeholder);
      insertAfter(parent, trgPlaceholder, dom);

      // Target marker
      if (_DBG_MVE_) insertDebugMarker(parent, dom, 'trg', dom.innerText);
      return;
    case AnimationPhase.MEASURE:
      // 3. Get geometry of moving node at target and store in animState
      const { height, width } = getDimensions(dom);
      animState.trgGeometry.height = height;
      animState.trgGeometry.width = width;
      if (_DBG_MVE_) console.log(dom.innerText, animState, dom)
      return;
    case AnimationPhase.EXPAND_SOURCE_PLACEHOLDER:
      // 4. Apply source geometry to placeholder unless it was the prev target
      if (isFirstMove) {
        setDimensions(srcPlaceholder, srcGeometry.width, srcGeometry.height);
        addClassName(dom, cls.start);
      }
      return
    case AnimationPhase.MEASURE_TARGET:
      // 5. Get position of target and apply transform to place node at start position
      const { x:  domTrgX, y: domTrgY } = getOffsetPosition(dom);
      animState.trgGeometry.x = domTrgX;
      animState.trgGeometry.y = domTrgY;     
      return
    case AnimationPhase.SET_START_STATE:
      /**
       * At this state we have measure the size of the moving node
       * both at source and target so now we let the source placeholder
       * fill the source space and move the node to start position
       * by transform
       */
      const deltaX = srcGeometry.x - trgGeometry.x;
      const deltaY = srcGeometry.y - trgGeometry.y;
      setTransform(dom, deltaX, deltaY);
      setDimensions(dom, srcGeometry.width, srcGeometry.height);
      if (_DBG_MVE_) console.log(dom.innerText, {deltaX, deltaY});
      return;
    case AnimationPhase.ACTIVATE_TRANSITIONS:
      // A reflow is triggered prior to this step
      // 5. Activate animation on source placeholder, target placeholder, element
      addClassName(srcPlaceholder, clsPlaceholder.active);
      addClassName(trgPlaceholder, clsPlaceholder.active);
      addClassName(dom, cls.active);
      removeClassName(dom, cls.start);
      return;
    case AnimationPhase.REGISTER_LISTENERS:
      // 6. Set an animation listener, code at end
      // Needs to be done after activating so timeout is calculated correctly
      // IMPORTANT! It is up to the animation handler to remove placeholders
      // TODO: Consider using three distinct listeners for: srcPlaceholder,
      // trgPlacehoder, dom.
      registerTransitionListener(
        [dom], _getWillMoveTransitionCallback(dom, cls, animState)
      );
      registerTransitionListener(
        [srcPlaceholder], _getWillMovePlaceholderTransitionCallback(srcPlaceholder)
      );
      return
    case AnimationPhase.ACTIVATE_ANIMATION:
      // 7. Set source placeholder size to 0 to collapse
      clearDimensions(srcPlaceholder);
      if (_DBG_MVE_) console.log('Collapse', srcPlaceholder);

      // 9. Apply target dimensions to target placeholder to expand
      //    and assign to ref.$TP
      setDimensions(trgPlaceholder, trgGeometry.width, trgGeometry.height);
      ref.$TP = trgPlaceholder;

      // 10. Apply target geometry of node to target
      setTransform(dom, 0, 0);
      setDimensions(dom, trgGeometry.width, trgGeometry.height);
  }
};

function _getWillMoveTransitionCallback(dom: HTMLElement, cls: AnimationClass, animState) {
  return () => {
    if (_DBG_MVE_) console.log('Finished animating move', dom, animState);

    const { ref, trgPlaceholder } = animState;
    // 13. if ref.$TP === targetPlaceholder do A otherwise do B
    //     a. we are done, cleanup node and set ref.$TP = null
    //     b. it is still animating so do nothing
    if (ref.$TP === trgPlaceholder) {
      removeChild(trgPlaceholder.parentNode as Element, trgPlaceholder);
      clearDimensions(dom);
      clearTransform(dom);
      removeClassName(dom, cls.active);
      ref.$TP = null;
    } else {
      if (_DBG_MVE_) console.log('_getWillMoveTransitionCallback', trgPlaceholder);
    }
  }
}

function _getWillMovePlaceholderTransitionCallback(placeholder: HTMLElement) {
  return () => {
    if (!isNull(placeholder.parentNode)) {
      removeChild(placeholder.parentNode as Element, placeholder);
    }
  }
}
