import { Component, InfernoNode } from 'inferno';
import { addClassName, clearDimensions, forceReflow, getDimensions, registerTransitionListener, removeClassName, setDimensions } from './utils';
import { isNullOrUndef } from 'inferno-shared';

type animationClass = {
  active: string;
  end: string;
  start: string;
};

type AnimationProp = {
  animation?: string | animationClass;
  children?: InfernoNode;
};

function getAnimationClass(animationProp: animationClass | string | undefined | null, prefix: string): animationClass {
  let animCls: animationClass;

  if (!isNullOrUndef(animationProp) && typeof animationProp === 'object') {
    animCls = animationProp;
  } else {
    const animationName = animationProp || 'inferno-animation';
    animCls = {
      active: `${animationName}${prefix}-active`,
      end: `${animationName}${prefix}-end`,
      start: `${animationName}${prefix}`
    };
  }

  return animCls;
}

export class AnimatedComponent<P = {}, S = {}> extends Component<AnimationProp & P, S> {
  public componentDidAppear(dom) {
    const { start, end, active } = getAnimationClass(this.props.animation, '-enter');

    // 1. Get height and set start of animation
    const { width, height } = getDimensions(dom);
    addClassName(dom, start);
    forceReflow();

    // 2. Activate transition
    addClassName(dom, active);

    // 3. Set an animation listener, code at end
    // Needs to be done after activating so timeout is calculated correctly
    registerTransitionListener(
      [dom],
      function () {
        // *** Cleanup ***
        // 5. Remove the element
        clearDimensions(dom);
        removeClassName(dom, active);
        removeClassName(dom, end);

        // 6. Call callback to allow stuff to happen
        // Not currently used but this is where one could
        // add a call to something like this.didAppearDone
      }
    );

    // 4. Activate target state
    requestAnimationFrame(() => {
      setDimensions(dom, width, height);
      removeClassName(dom, start);
      addClassName(dom, end);
    });
  }

  public componentWillDisappear(dom, callback) {
    const { start, end, active } = getAnimationClass(this.props.animation, '-leave');

    // 1. Get dimensions and set animation start state
    const { width, height } = getDimensions(dom);
    setDimensions(dom, width, height);
    addClassName(dom, start);

    // 2. Activate transitions
    addClassName(dom, active);

    // 3. Set an animation listener, code at end
    // Needs to be done after activating so timeout is calculated correctly
    registerTransitionListener(
      [dom],
      function () {
        // *** Cleanup not needed since node is removed ***
        callback();
      }
    );

    // 4. Activate target state
    requestAnimationFrame(() => {
      addClassName(dom, end);
      removeClassName(dom, start);
      clearDimensions(dom);
    });
  }
}
