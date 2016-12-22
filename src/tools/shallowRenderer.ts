import Component from 'inferno-component';
import { VNode } from '../core/structures';
import { isElement } from './testUtils';
import { throwError } from '../shared';

class ShallowComponentWrapper extends Component<any, any> {
  private _context: Object;
  
  constructor(element, context) {
    super({ children: element });
    this._context = context;
  }

  getChildContext() {
    return this._context;
  }

  render({ children }) {
    return children;
  }
}

export default class InfernoShallowRenderer {
  private _instance: ShallowComponentWrapper | null = null;

  getMountedInstance() {
    return this._instance ? this._instance._vNode : null;
  }
  
  render(element: VNode, context?: Object) {
    if (!isElement(element)) {
      throwError('ShallowRenderer render(): Invalid component element');
    }
    if (typeof element.type !== 'string') {
      throwError(
        `InfernoShallowRenderer render(): Shallow rendering works only with custom
        components, not primitives (${element.type}). Instead of calling '.render(el)' and
        inspecting the rendered output, look at 'el.props' directly instead.`
      );
    }
    
    this._instance = new ShallowComponentWrapper(element, context);

    return this.getRenderOutput();
  }

  getRenderOutput() {
    return (
      (
        this._instance &&
        this._instance._vNode
      ) || null
    );
  }

  unmount(): void {
    if (this._instance) {
      this._instance.componentWillUnmount();
    }
  }
}
