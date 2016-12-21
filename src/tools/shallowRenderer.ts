import { VNode } from '../core/structures';
import { isElement } from './test';
import { throwError } from '../shared';

class ShallowComponentWrapper {
  _vNode;
  constructor(element) {
    this._vNode = element;
  }
}

export default class ReactShallowRenderer {
  private _instance: ShallowComponentWrapper | null = null;
  getMountedInstance() {
    return this._instance ? this._instance._vNode : null;
  }
  render(element: VNode, context) {
    if (!isElement(element)) {
      throwError('ShallowRenderer render(): Invalid component element');
    }
    if (typeof element.type !== 'string') {
      throwError(
        `ReactShallowRenderer render(): Shallow rendering works only with custom
        components, not primitives (${element.type}). Instead of calling '.render(el)' and
        inspecting the rendered output, look at 'el.props' directly instead.`
      );
    }

    if (!context) {
      context = {};
    }
    // ReactUpdates.batchedUpdates(_batchedRender, this, element, context);

    return this.getRenderOutput();
  }
  getRenderOutput() {
    return (
      (
        this._instance &&
        this._instance._vNode &&
        this._instance._vNode.dom.InnerHTML
      ) || null
    );
  }
  unmount() {
    if (this._instance) {
      // ReactReconciler.unmountComponent(
      //   this._instance,
      //   false, /* safely */
      //   false /* skipLifecycle */
      // );
    }
  }
  _render(element, transaction, context) {
    if (this._instance) {
      // ReactReconciler.receiveComponent(
      //   this._instance,
      //   element,
      //   transaction,
      //   context
      // );
    } else {
      const instance = new ShallowComponentWrapper(element);
      // ReactReconciler.mountComponent(instance, transaction, null, null, context, 0);
      this._instance = instance;
    }
  }
}
