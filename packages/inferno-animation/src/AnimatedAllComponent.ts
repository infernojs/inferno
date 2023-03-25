import { Component, InfernoNode } from 'inferno';
import { AnimationClass, componentDidAppear, componentWillDisappear, componentWillMove } from './animations';

type AnimationProp = {
  animation?: string | AnimationClass;
  children?: InfernoNode;
};

export abstract class AnimatedAllComponent<P = {}, S = {}> extends Component<AnimationProp & P, S> {
  public componentDidAppear(dom: HTMLElement | SVGElement) {
    componentDidAppear(dom, this.props);
  }

  public componentWillDisappear(dom: HTMLElement | SVGElement, callback: Function) {
    componentWillDisappear(dom, this.props, callback);
  }

  public componentWillMove(parentVNode, parent: HTMLElement | SVGElement, dom: HTMLElement | SVGElement) {
    componentWillMove(parentVNode, parent, dom, this.props);
  }
}
