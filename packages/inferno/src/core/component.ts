import { InfernoChildren, Props, Refs, VNode } from './implementation';
import { combineFrom, isFunction, isNullOrUndef, throwError } from 'inferno-shared';
import { updateClassComponent } from '../DOM/patching';
import { callAll, EMPTY_OBJ, LIFECYCLE, findDOMfromVNode } from '../DOM/utils/common';

const QUEUE: Array<Component<any, any>> = [];
const nextTick = isFunction(Promise) ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

function queueStateChanges<P, S>(component: Component<P, S>, newState: Partial<S> | ((s: S, p: P, c: any) => Partial<S>), callback: Function | undefined, force: boolean): void {
  if (isFunction(newState)) {
    newState = newState(component.state!, component.props, component.context);
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
      if (QUEUE.length === 0) {
        applyState(component, force, callback);
      } else {
        QUEUE.push(component);
      }
    } else {
      if (QUEUE.push(component) === 1) {
        nextTick(rerender);
      }
      if (isFunction(callback)) {
        let QU = component.$QU;

        if (!QU) {
          QU = component.$QU = [] as Function[];
        }
        QU.push(callback);
      }
    }
  } else {
    component.$PSS = true;
    if (component.$BR && isFunction(callback)) {
      LIFECYCLE.push(callback.bind(component));
    }
  }
}

function callSetStateCallbacks(component) {
  const queue = component.$QU;

  for (let i = 0, len = (queue as Function[]).length; i < len; i++) {
    (queue as Function[])[i].call(component);
  }

  component.$QU = null;
}

export function rerender() {
  let component;
  while ((component = QUEUE.pop())) {
    if (!component.$UPD) {
      const queue = component.$QU;

      applyState(component, false, queue ? callSetStateCallbacks.bind(null, component) : null);
    }
  }
}

function applyState<P, S>(component: Component<P, S>, force: boolean, callback?: Function): void {
  if (component.$UN) {
    return;
  }
  if (force || !component.$BR) {
    component.$PSS = false;
    const pendingState = component.$PS;

    component.$PS = null;
    component.$UPD = true;

    updateClassComponent(
      component,
      combineFrom(component.state, pendingState),
      component.props,
      (findDOMfromVNode(component.$LI) as Element).parentNode as Element,
      component.context,
      false,
      force,
      null
    );

    component.$UPD = false;
    
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

  /**
   * @deprecated since version 6.0
   */
  componentWillMount?(): void;

  /**
   * @deprecated since version 6.0
   */
  componentWillReceiveProps?(nextProps: P, nextContext: any): void;

  shouldComponentUpdate?(nextProps: P, nextState: S, context: any): boolean;

  /**
   * @deprecated since version 6.0
   */
  componentWillUpdate?(nextProps: P, nextState: S, context: any): void;

  componentDidUpdate?(prevProps: P, prevState: S, snapshot: any): void;

  componentWillUnmount?(): void;

  getChildContext?(): void;
}

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
  public $PS: Partial<S> | null = null; // PENDING STATE (PARTIAL or FULL)
  public $LI: any = null; // LAST INPUT
  public $UN : boolean= false; // UNMOUNTED
  public $CX: any = null; // CHILDCONTEXT
  public $UPD: boolean = true; // UPDATING
  public $QU: Function[] | null = null; // QUEUE
  public $N: boolean = false; // Flag
  public $SSR?: boolean; // Server side rendering flag, true when rendering on server, non existent on client
  public $P: Element | null = null;

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

  public setState(newState: Partial<S> | ((s: S, p: P, c: any) => Partial<S>), callback?: Function) {
    if (this.$UN) {
      return;
    }
    if (!this.$BS) {
      queueStateChanges(this, newState, callback, false);
    } else {
      // Development warning
      if (process.env.NODE_ENV !== 'production') {
        throwError('cannot update state via setState() in constructor. Instead, assign to `this.state` directly or define a `state = {};`');
      }
      return;
    }
  }

  public getSnapshotBeforeUpdate?(prevProps: Props<any>, prevState: S): any;

  public static getDerivedStateFromProps?(nextProps: Props<any>, state: any): any;

  // tslint:disable-next-line:no-empty
  public render(_nextProps: P, _nextState, _nextContext): any {}
}
