import { Component } from 'inferno'
import {
  addClassName,
  removeClassName,
  registerTransitionListener,
  forceReflow,
  clearDimensions,
  getDimensions,
  setDimensions,
} from './utils'

type Props = {
  animation: string|object
}

export default class AnimatedComponent extends Component<Props> {
  didAppear (dom) {
    let animCls: any; // TODO: This should be typed properly
    if (typeof this.props.animation === 'object') {
      animCls = this.props.animation;
    }
    else {
      const animationName = this.props.animation || 'inferno-animation';
      animCls = {
        'start': animationName + '-enter',
        'active': animationName + '-enter-active',
        'end': animationName + '-enter-end'
      }
    }
  
    // 1. Get height and set start of animation
    const { width, height } = getDimensions(dom);
    addClassName(dom, animCls.start);
    forceReflow();
  
    // 2. Activate transition
    addClassName(dom, animCls.active);
  
    // 3. Set an animation listener, code at end
    // Needs to be done after activating so timeout is calculated correctly
    registerTransitionListener([dom, dom.children[0]], function () {
      // *** Cleanup ***
      // 5. Remove the element
      clearDimensions(dom);
      removeClassName(dom, animCls.active);
      removeClassName(dom, animCls.end);
      
      // 6. Call callback to allow stuff to happen
      // Not currently used but this is where one could 
      // add a call to something like this.didAppearDone
    }, false)
  
    // 4. Activate target state
    requestAnimationFrame(() => {
      setDimensions(dom, width, height);
      removeClassName(dom, animCls.start);
      addClassName(dom, animCls.end);
    });
  }

  willDisappear (dom, callback) {
    let animCls;
    if (typeof this.props.animation === 'object') {
      animCls = this.props.animation;
    }
    else {
      const animationName = this.props.animation || 'inferno-animation';
      animCls = {
        'start': animationName + '-leave',
        'active': animationName + '-leave-active',
        'end': animationName + '-leave-end'
      }
    }
  
    // 1. Get dimensions and set animation start state
    const { width, height } = getDimensions(dom);
    setDimensions(dom, width, height);
    addClassName(dom, animCls.start);
    
    // 2. Activate transitions
    addClassName(dom, animCls.active);
  
    // 3. Set an animation listener, code at end
    // Needs to be done after activating so timeout is calculated correctly
    registerTransitionListener(dom, function () {
      // *** Cleanup not needed since node is removed ***
      callback();
    }, false)
  
    // 4. Activate target state
    requestAnimationFrame(() => {
      addClassName(dom, animCls.end);
      removeClassName(dom, animCls.start);
      clearDimensions(dom);
    });
  }
}