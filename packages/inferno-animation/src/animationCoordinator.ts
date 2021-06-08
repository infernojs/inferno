import { forceReflow } from './utils';


// This is only used for development and should be set to false for release
const _DBG_COORD_ = false && process.env.NODE_ENV !== 'production';

export const enum AnimationPhase {
  INITIALIZE,
  MEASURE,
  SET_START_STATE,
  ACTIVATE_TRANSITIONS,
  REGISTER_LISTENERS,
  ACTIVATE_ANIMATION,
  length // This will equal length of actual phases since TS converts this to a zero based list of ints
}


let _animationQueue: Function[] = [];
let _animationActivationQueue: Function[] = [];
const IDLE = 0;
let _nextAnimationFrame: number = IDLE;
let _nextActivateAnimationFrame: number = IDLE;

function _runActivateAnimationPhase() {
  _nextActivateAnimationFrame = IDLE;
  // Get animations to execute
  const animationQueue = _animationActivationQueue;
  // Clear global queue
  _animationActivationQueue = [];

  for (let i = 0; i < animationQueue.length; i++) {
    animationQueue[i](AnimationPhase.ACTIVATE_ANIMATION);
  }
}

function _runAnimationPhases() {
  _nextAnimationFrame = IDLE;
  
  // Get animations to execute
  const animationQueue = _animationQueue;
  // Clear global queue
  _animationQueue = [];

  // So what this does is run the animation phases in order. Most of the phases are invoked
  // by a simple call to all the registered callbacks. However:
  //
  // - ACTIVATE_TRANSITIONS require a reflow in order to not
  // interfere with the previous setting of the animation start class
  //
  // - ACTIVATE_ANIMATION needs to be called async so the transitions actually fire,
  // we choose to use an animation frame.
  //
  for (let i = 0; i < AnimationPhase.length; i++) {
    const phase = i as AnimationPhase;
    switch (phase) {
      case AnimationPhase.ACTIVATE_ANIMATION:
        // Final phase - Activate animations
        _animationActivationQueue = _animationActivationQueue.concat(animationQueue);
        if (_nextActivateAnimationFrame === IDLE) {
          // Animations are activated on the next animation frame
          _nextActivateAnimationFrame = requestAnimationFrame(_runActivateAnimationPhase);
        }
        break;
      case AnimationPhase.ACTIVATE_TRANSITIONS:
        // Force reflow before executing ACTIVATE_TRANSITIONS
        forceReflow();
      default:
        for (let j = 0; j < animationQueue.length; j++) {
          animationQueue[j](phase);
        }
    }
  }
}

function _debugAnimationPhases(phase: AnimationPhase, animationQueue) {
  // When debugging we call _runAnimationPhases once for each phase
  // so only set to idle when done
  if (phase === AnimationPhase.length - 1) {
    _nextAnimationFrame = IDLE;
  }

  switch (phase) {
    case AnimationPhase.ACTIVATE_ANIMATION:
      // Final phase - Activate animations
      _animationActivationQueue = _animationActivationQueue.concat(animationQueue);
      if (_nextActivateAnimationFrame === IDLE) {
        // Animations are activated on the next animation frame
        _nextActivateAnimationFrame = requestAnimationFrame(_runActivateAnimationPhase);
      }
      break;
    case AnimationPhase.ACTIVATE_TRANSITIONS:
      // Force reflow before executing ACTIVATE_TRANSITIONS
      forceReflow();
    default:
      for (let j = 0; j < animationQueue.length; j++) {
        animationQueue[j](phase);
      }
  }
  return phase + 1;
}

export function queueAnimation(callback: Function) {
  _animationQueue.push(callback);
  if (_nextAnimationFrame === IDLE) {
    if (!_DBG_COORD_) {
      _nextAnimationFrame = requestAnimationFrame(_runAnimationPhases);
    } else {
      /**** DEV DEBUGGING code path ****/
      // Run animation phases one at a time when debugging
      // to allow visually inspecting changes.
      let _animationDebugQueue = _animationQueue;
      const _runPhase = (startPhase) => {
        _nextAnimationFrame = requestAnimationFrame(() => {
          // Reset the global animation queue so any changes
          // added during this animation round is queued
          if (_animationDebugQueue === _animationQueue) {
            _animationQueue = [];
          }
          
          const nextStartPhase = _debugAnimationPhases(startPhase, _animationDebugQueue);
          if (nextStartPhase !== undefined && nextStartPhase < AnimationPhase.length) {
            _runPhase(nextStartPhase);
          } else if (_animationQueue.length > 0) {
            // All phases done, check if the queue has been repopulated
            // and rerun if it has
            _animationDebugQueue = _animationQueue;
            _runPhase(0);
          }
        });
      }
      // TODO: We could create hooks to show a simply UI to control
      // animation execution. For now you need to set a break point
      _runPhase(0);
      /**** /end DEV DEBUGGING ****/
    }
  }
}

// This is needed for tests. Coordinated animations are run on
// next animation frame so we need to make sure we wait for them to finish.
export function hasPendingAnimations() {
  return _nextAnimationFrame !== IDLE || _nextActivateAnimationFrame !== IDLE;
}
