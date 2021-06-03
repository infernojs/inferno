import { Component, InfernoNode } from 'inferno';
import { componentWillMove, AnimationClass } from './animations';

type AnimationProp = {
  animation?: string | AnimationClass;
  children?: InfernoNode;
};

export class AnimatedMoveComponent<P = {}, S = {}> extends Component<AnimationProp & P, S> {
  public componentWillMove(instance, dom: HTMLElement, parent: HTMLElement, next: HTMLElement, props) {
    componentWillMove(instance, dom, parent, next, props);
  }
}
