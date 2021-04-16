import { forceReflow } from './utils';

export enum AnimationPhase {
  INITIALIZE,
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
  
  // Phase 1 - Initialize the animation
  for (let i = 0; i < animationQueue.length; i++) {
    animationQueue[i](AnimationPhase.INITIALIZE);
  }

  // Phase 2 - Activate tranistions
  // Before registering listeners we need to cause a reflow, otherwise
  // they won't measure durations properly for the fallback timeout
  forceReflow()
  for (let i = 0; i < animationQueue.length; i++) {
    animationQueue[i](AnimationPhase.ACTIVATE_TRANSITIONS);
  }
  
  // Phase 3 - Register transition listeners
  for (let i = 0; i < animationQueue.length; i++) {
    animationQueue[i](AnimationPhase.REGISTER_LISTENERS);
  }

  // Phase 4 - Activate animations
  _animationActivationQueue = _animationActivationQueue.concat(animationQueue);
  if (_nextActivateAnimationFrame === undefined) {
    // Animations are activated on the next animation frame
    _nextActivateAnimationFrame = requestAnimationFrame(_runActivateAnimationPhase);
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