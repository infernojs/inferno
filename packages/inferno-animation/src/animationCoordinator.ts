import { forceReflow } from './utils';

export enum AnimationPhase {
  INITIALIZE,
  MEASURE,
  SET_START_STATE,
  ACTIVATE_TRANSITIONS,
  REGISTER_LISTENERS,
  ACTIVATE_ANIMATION
}

let _animationQueue: Function[] = [];
let _animationActivationQueue: Function[] = [];
let _nextAnimationFrame;
let _nextActivateAnimationFrame;

function _runActivateAnimationPhase() {
  _nextActivateAnimationFrame = undefined;
  // Get animations to execute
  const animationQueue = _animationActivationQueue;
  // Clear global queue
  _animationActivationQueue = [];
  
  for (let i = 0; i < animationQueue.length; i++) {
    animationQueue[i](AnimationPhase.ACTIVATE_ANIMATION);
  }
}

function _runAnimationPhases() {
  _nextAnimationFrame = undefined;
  // Get animations to execute
  const animationQueue = _animationQueue;
  // Clear global queue
  _animationQueue = [];
  
  // So what this does is run the animation phases in order. Most of the phases are invoked
  // by a simple call to all the registered callbacks. However:
  // - ACTIVATE_TRANSITIONS require a reflow in order to not
  // interfere with the previous setting of the animation start class
  // - ACTIVATE_ANIMATION needs to be called async so the transitions actually fire,
  // we choose to use an animation frame.
  for (let i = 0; i < 6; i++) {
    const phase = i as AnimationPhase;
    if (phase !== AnimationPhase.ACTIVATE_ANIMATION) {
      if (phase === AnimationPhase.ACTIVATE_TRANSITIONS) {
        forceReflow()
      }
      for (let i = 0; i < animationQueue.length; i++) {
        animationQueue[i](phase);
      }
    }
    else {
      // Final phase - Activate animations
      _animationActivationQueue = _animationActivationQueue.concat(animationQueue);
      if (_nextActivateAnimationFrame === undefined) {
        // Animations are activated on the next animation frame
        _nextActivateAnimationFrame = requestAnimationFrame(_runActivateAnimationPhase);
      }
    }
    
  }
}

export function queueAnimation(callback: Function) {
  _animationQueue.push(callback)
  if (_nextAnimationFrame === undefined) {
    _nextAnimationFrame = requestAnimationFrame(_runAnimationPhases)
  }
}

// This is needed for tests. Coordinated animations are run on
// next animation frame so we need to make sure we wait for them to finish.
export function hasPendingAnimations() {
  return _nextAnimationFrame !== undefined || _nextActivateAnimationFrame !== undefined;
}