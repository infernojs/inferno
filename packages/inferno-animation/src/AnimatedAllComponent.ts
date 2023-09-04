import { Component, type InfernoNode, type ParentDOM } from 'inferno';
import {
  type AnimationClass,
  componentDidAppear,
  componentWillDisappear,
  componentWillMove,
} from './animations';

interface AnimationProp {
  animation?: string | AnimationClass;
  children?: InfernoNode;
}

export abstract class AnimatedAllComponent<P, S> extends Component<
  AnimationProp & P,
  S
> {
  public componentDidAppear(dom: HTMLElement | SVGElement): void {
    componentDidAppear(dom, this.props);
  }

  public componentWillDisappear(
    dom: HTMLElement | SVGElement,
    callback: () => void,
  ): void {
    componentWillDisappear(dom, this.props, callback);
  }

  public componentWillMove(
    parentVNode,
    parent: ParentDOM,
    dom: HTMLElement | SVGElement,
  ): void {
    componentWillMove(parentVNode, parent, dom, this.props);
  }
}
