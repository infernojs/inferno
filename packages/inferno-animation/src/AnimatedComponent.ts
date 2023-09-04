import { Component, type InfernoNode } from 'inferno';
import {
  type AnimationClass,
  componentDidAppear,
  componentWillDisappear,
} from './animations';

interface AnimationProp {
  animation?: string | AnimationClass;
  children?: InfernoNode;
}

export abstract class AnimatedComponent<P, S> extends Component<
  AnimationProp & P,
  S
> {
  public componentDidAppear(dom: HTMLElement): void {
    componentDidAppear(dom, this.props);
  }

  public componentWillDisappear(
    dom: HTMLElement | SVGElement,
    callback: () => void,
  ): void {
    componentWillDisappear(dom, this.props, callback);
  }
}
