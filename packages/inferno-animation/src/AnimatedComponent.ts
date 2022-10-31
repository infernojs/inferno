import { Component, Inferno } from 'inferno';
import { AnimationClass, componentDidAppear, componentWillDisappear } from './animations';

type AnimationProp = {
  animation?: string | AnimationClass;
  children?: Inferno.InfernoNode;
};

export abstract class AnimatedComponent<P = {}, S = {}> extends Component<AnimationProp & P, S> {
  public componentDidAppear(dom: HTMLElement) {
    componentDidAppear(dom, this.props);
  }

  public componentWillDisappear(dom: HTMLElement | SVGElement, callback: Function) {
    componentWillDisappear(dom, this.props, callback);
  }
}
