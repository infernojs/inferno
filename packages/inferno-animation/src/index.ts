import {
  addClassName,
  clearDimensions,
  forceReflow,
  getDimensions,
  registerTransitionListener,
  removeClassName,
  setDimensions,
  setDisplay,
} from './utils';

export { AnimatedAllComponent } from './AnimatedAllComponent';
export { AnimatedComponent } from './AnimatedComponent';
export { AnimatedMoveComponent } from './AnimatedMoveComponent';
export {
  componentDidAppear,
  componentWillDisappear,
  componentWillMove,
  type AnimationClass,
} from './animations';
export { hasPendingAnimations } from './animationCoordinator';

export const utils = {
  addClassName,
  clearDimensions,
  forceReflow,
  getDimensions,
  registerTransitionListener,
  removeClassName,
  setDimensions,
  setDisplay,
};
