import { InfernoChildren, VNode } from '../core/shapes';

class ShallowRenderer {
  private _instance: InfernoChildren = null;
  
  render(element: InfernoInput): VNode {

  }

  getRenderedOutput(): VNode {
    return this._instance._vNode;
  }
}