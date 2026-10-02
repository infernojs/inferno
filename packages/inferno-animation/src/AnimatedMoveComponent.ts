import { Component, type InfernoNode } from 'inferno';
import { type AnimationClass, componentWillMove } from './animations';
import { preparedOwnerMayMove } from './moveAnimations';

interface AnimationProp {
  animation?: string | AnimationClass;
  children?: InfernoNode;
}

export abstract class AnimatedMoveComponent<P, S> extends Component<
  AnimationProp & P,
  S
> {
  public componentWillMove(
    parentVNode,
    parent: HTMLElement | SVGElement,
    dom: HTMLElement | SVGElement,
  ): void {
    if (preparedOwnerMayMove()) {
      componentWillMove(parentVNode, parent, dom, this.props);
    }
  }
}
