import { Component, Inferno } from 'inferno';
import { AnimationClass, componentDidAppear, componentWillDisappear, componentWillMove } from './animations';

type AnimationProp = {
  animation?: string | AnimationClass;
  children?: Inferno.InfernoNode;
};

export abstract class AnimatedAllComponent<P = {}, S = {}> extends Component<AnimationProp & P, S> {
  public componentDidAppear(dom: HTMLElement) {
    componentDidAppear(dom, this.props);
  }

  public componentWillDisappear(dom: HTMLElement, callback: Function) {
    componentWillDisappear(dom, this.props, callback);
  }

  public componentWillMove(parentVNode, parent: HTMLElement, dom: HTMLElement, props: any) {
    componentWillMove(parentVNode, parent, dom, props);
  }
}
