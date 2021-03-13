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
  didAppear (node) {
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
    const { width, height } = getDimensions(node)
    addClassName(node, animCls.start)
    forceReflow()
  
    // 2. Activate transition
    addClassName(node, animCls.active)
  
    // 3. Set an animation listener, code at end
    // Needs to be done after activating so timeout is calculated correctly
    registerTransitionListener([node, node.children[0]], function () {
      // *** Cleanup ***
      // 5. Remove the element
      clearDimensions(node)
      removeClassName(node, animCls.active)
      removeClassName(node, animCls.end)
      
      // 6. Call callback to allow stuff to happen
      // callback(node)
    }, false)
  
    // 4. Activate target state
    setTimeout(() => {
      setDimensions(node, width, height)
      removeClassName(node, animCls.start)
      addClassName(node, animCls.end)
    }, 5)
  }

  willDisappear (node, callback) {
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
    const { width, height } = getDimensions(node)
    setDimensions(node, width, height)
    addClassName(node, animCls.start)
    
    // 2. Activate transitions
    addClassName(node, animCls.active);
  
    // 3. Set an animation listener, code at end
    // Needs to be done after activating so timeout is calculated correctly
    registerTransitionListener(node, function () {
      // *** Cleanup ***
      callback()
    }, false)
  
    // 4. Activate target state
    setTimeout(() => {
      addClassName(node, animCls.end)
      removeClassName(node, animCls.start)
      clearDimensions(node)
    }, 5)
  }
}