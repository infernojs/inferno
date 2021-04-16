export { AnimatedComponent } from './AnimatedComponent';
export { componentDidAppear, componentWillDisappear, AnimationClass } from './animations';
export { hasPendingAnimations } from './animationCoordinator';

import { addClassName, clearDimensions, forceReflow, getDimensions, registerTransitionListener, removeClassName, setDimensions, setDisplay } from './utils';
export const utils = {
  addClassName,
  clearDimensions,
  forceReflow,
  getDimensions,
  registerTransitionListener,
  removeClassName,
  setDimensions,
  setDisplay
};
