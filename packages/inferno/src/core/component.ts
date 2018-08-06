import { VNodeFlags } from 'inferno-vnode-flags';
import { Props, VNode, InfernoChildren, Refs } from './implementation';
import { combineFrom, isFunction, isNull, isNullOrUndef, throwError } from 'inferno-shared';
import { updateClassComponent } from '../DOM/patching';
import { callAll, EMPTY_OBJ, LIFECYCLE } from '../DOM/utils/common';

const resolvedPromise: any = typeof Promise === 'undefined' ? null : Promise.resolve();
// raf.bind(window) is needed to work around bug in IE10-IE11 strict mode (TypeError: Invalid calling object)
const fallbackMethod = typeof requestAnimationFrame === 'undefined' ? setTimeout : requestAnimationFrame.bind(window);
function nextTick(fn) {
  if (resolvedPromise) {
    return resolvedPromise.then(fn);
  }
  return fallbackMethod(fn);
}

function queueStateChanges<P, S>(component: Component<P, S>, newState: S | Function, callback: Function | undefined, force: boolean): void {
  if (isFunction(newState)) {
    newState = newState(component.state, component.props, component.context) as S;
  }
  const pending = component.$PS;

  if (isNullOrUndef(pending)) {
    component.$PS = newState;
  } else {
    for (const stateKey in newState) {
      pending[stateKey] = newState[stateKey];
    }
  }

  if (!component.$PSS && !component.$BR) {
    if (!component.$UPD) {
      component.$PSS = true;
      component.$UPD = true;
      applyState(component, force, callback);
      component.$UPD = false;
    } else {
      // Async
      let queue = component.$QU;

      if (isNull(queue)) {
        queue = component.$QU = [] as Function[];
        nextTick(promiseCallback(component, queue));
      }
      if (isFunction(callback)) {
        queue.push(callback);
      }
    }
  } else {
    component.$PSS = true;
    if (component.$BR && isFunction(callback)) {
      LIFECYCLE.push(callback.bind(component));
    }
  }
}

function promiseCallback(component, queue) {
  return () => {
    component.$QU = null;
    component.$UPD = true;
    applyState(component, false, () => {
      for (let i = 0, len = (queue as Function[]).length; i < len; i++) {
        (queue as Function[])[i].call(component);
      }
    });
    component.$UPD = false;
  };
}

function applyState<P, S>(component: Component<P, S>, force: boolean, callback?: Function): void {
  if (component.$UN) {
    return;
  }
  if (force || !component.$BR) {
    component.$PSS = false;
    const pendingState = component.$PS;
    const prevState = component.state;
    const nextState = combineFrom(prevState, pendingState) as any;
    const props = component.props as P;
    const context = component.context;

    component.$PS = null;
    let vNode = component.$V as VNode;
    const lastInput = component.$LI as VNode;
    const parentDom = lastInput.dom && lastInput.dom.parentNode;
    updateClassComponent(component, nextState, vNode, props, parentDom, context, (vNode.flags & VNodeFlags.SvgElement) > 0, force, true);
    if (component.$UN) {
      return;
    }

    if ((component.$LI.flags & VNodeFlags.Portal) === 0) {
      const dom = component.$LI.dom;
      while (!isNull((vNode = vNode.parentVNode as any))) {
        if ((vNode.flags & VNodeFlags.Component) > 0) {
          vNode.dom = dom;
        }
      }
    }

    if (LIFECYCLE.length > 0) {
      callAll(LIFECYCLE);
    }
  } else {
    component.state = component.$PS as any;
    component.$PS = null;
  }
  if (isFunction(callback)) {
    callback.call(component);
  }
}

export type ComponentType<P = {}> = ComponentClass<P> | StatelessComponent<P>;

export type SFC<P = {}> = StatelessComponent<P>;

export interface StatelessComponent<P = {}> {
  (props: P & { children?: InfernoChildren }, context?: any): VNode<P> | null;

  defaultProps?: Partial<P>;
  displayName?: string;
  defaultHooks?: Refs<P>;
}

export interface ComponentClass<P = {}, S = {}> {
  new (props?: P, context?: any): Component<P, {}>;

  defaultProps?: Partial<P>;
  displayName?: string;
  refs?: any;

  componentDidMount?(): void;

  componentWillMount?(): void;

  componentWillReceiveProps?(nextProps: P, nextContext: any): void;

  shouldComponentUpdate?(nextProps: P, nextState: S, nextContext: any): boolean;

  componentWillUpdate?(nextProps: P, nextState: S, nextContext: any): void;

  componentDidUpdate?(prevProps: P, prevState: S, prevContext: any): void;

  componentWillUnmount?(): void;

  getChildContext?(): void;
}

export type Validator<T> = { bivarianceHack(object: T, key: string, componentName: string, ...rest: any[]): Error | null }['bivarianceHack'];

export interface Requireable<T> extends Validator<T> {
  isRequired: Validator<T>;
}

export type ValidationMap<T> = { [K in keyof T]?: Validator<T> };

export interface Component<P = {}, S = {}> extends ComponentClass<P, S> {}
export class Component<P, S> {
  // Public
  public static defaultProps;
  public state: S | null = null;
  public props: Props<P, this> & P;
  public context: any;
  public refs?: any;

  // Internal properties
  public $BR: boolean = false; // BLOCK RENDER
  public $BS: boolean = true; // BLOCK STATE
  public $PSS: boolean = false; // PENDING SET STATE
  public $PS: S | null = null; // PENDING STATE (PARTIAL or FULL)
  public $LI: any = null; // LAST INPUT
  public $V: VNode | null = null; // VNODE
  public $UN = false; // UNMOUNTED
  public $CX = null; // CHILDCONTEXT
  public $UPD: boolean = true; // UPDATING
  public $QU: Function[] | null = null; // QUEUE

  constructor(props?: P, context?: any) {
    /** @type {object} */
    this.props = props || (EMPTY_OBJ as P);

    /** @type {object} */
    this.context = context || EMPTY_OBJ; // context should not be mutable
  }

  public forceUpdate(callback?: Function) {
    if (this.$UN) {
      return;
    }
    // Do not allow double render during force update
    queueStateChanges(this, {} as any, callback, true);
  }

  public setState(newState: { [k in keyof S]?: S[k] } | Function, callback?: Function) {
    if (this.$UN) {
      return;
    }
    if (!this.$BS) {
      queueStateChanges(this, newState, callback, false);
    } else {
      // Development warning
      if (process.env.NODE_ENV !== 'production') {
        throwError('cannot update state via setState() in componentWillUpdate() or constructor.');
      }
      return;
    }
  }

  // tslint:disable-next-line:no-empty
  public render(nextProps: P, nextState, nextContext): InfernoChildren | void {}
}
