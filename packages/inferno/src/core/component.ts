import { IComponent, InfernoNode, StatelessComponent } from './types';
import { combineFrom, isFunction, isNullOrUndef, throwError } from 'inferno-shared';
import { updateClassComponent } from '../DOM/patching';
import { callAll, EMPTY_OBJ, findDOMfromVNode, renderCheck } from '../DOM/utils/common';

const QUEUE: Array<Component<any, any>> = [];
const nextTick =
  typeof Promise !== 'undefined'
    ? Promise.resolve().then.bind(Promise.resolve())
    : function(a) {
        window.setTimeout(a, 0);
      };
let microTaskPending = false;

function queueStateChanges<P, S>(component: Component<P, S>, newState: any, callback: Function | undefined, force: boolean): void {
  const pending = component.$PS;

  if (isFunction(newState)) {
    newState = newState(pending ? combineFrom(component.state!, pending) : component.state, component.props, component.context);
  }

  if (isNullOrUndef(pending)) {
    component.$PS = newState;
  } else {
    for (const stateKey in newState) {
      pending[stateKey] = newState[stateKey];
    }
  }

  if (!component.$BR) {
    if (!renderCheck.v) {
      if (QUEUE.length === 0) {
        applyState(component, force, callback);
        return;
      }
    }
    if (QUEUE.indexOf(component) === -1) {
      QUEUE.push(component);
    }
    if (!microTaskPending) {
      microTaskPending = true;
      nextTick(rerender);
    }
    if (isFunction(callback)) {
      let QU = component.$QU;

      if (!QU) {
        QU = component.$QU = [] as Function[];
      }
      QU.push(callback);
    }
  } else if (isFunction(callback)) {
    (component.$L as Function[]).push(callback.bind(component));
  }
}

function callSetStateCallbacks(component) {
  const queue = component.$QU;

  for (let i = 0, len = (queue as Function[]).length; i < len; ++i) {
    (queue as Function[])[i].call(component);
  }

  component.$QU = null;
}

export function rerender() {
  let component;
  microTaskPending = false;
  while ((component = QUEUE.pop())) {
    const queue = component.$QU;

    applyState(component, false, queue ? callSetStateCallbacks.bind(null, component) : null);
  }
}

function applyState<P, S>(component: Component<P, S>, force: boolean, callback?: Function): void {
  if (component.$UN) {
    return;
  }
  if (force || !component.$BR) {
    const pendingState = component.$PS;

    component.$PS = null;

    const lifecycle: Function[] = [];

    renderCheck.v = true;

    updateClassComponent(
      component,
      combineFrom(component.state, pendingState),
      component.props,
      (findDOMfromVNode(component.$LI, true) as Element).parentNode as Element,
      component.context,
      component.$SVG,
      force,
      null,
      lifecycle
    );

    if (lifecycle.length > 0) {
      callAll(lifecycle);
    }

    renderCheck.v = false;
  } else {
    component.state = component.$PS as any;
    component.$PS = null;
  }
  if (isFunction(callback)) {
    callback.call(component);
  }
}
export type ComponentType<P = {}> = Component<P> | StatelessComponent<P>;

export class Component<P = {}, S = {}> implements IComponent<P, S> {
  // Public
  public state: S | null = null;
  public props: {
    children?: InfernoNode;
  } & P;
  public context: any;
  public displayName?: string;
  public refs?: any;

  // Internal properties
  public $BR: boolean = false; // BLOCK RENDER
  public $BS: boolean = true; // BLOCK STATE
  public $PS: Partial<S> | null = null; // PENDING STATE (PARTIAL or FULL)
  public $LI: any = null; // LAST INPUT
  public $UN: boolean = false; // UNMOUNTED
  public $CX: any = null; // CHILDCONTEXT
  public $QU: Function[] | null = null; // QUEUE
  public $N: boolean = false; // Uses new lifecycle API Flag
  public $SSR?: boolean; // Server side rendering flag, true when rendering on server, non existent on client
  public $L: Function[] | null = null; // Current lifecycle of this component
  public $SVG: boolean = false; // Flag to keep track if component is inside SVG tree

  constructor(props?: P, context?: any) {
    this.props = props || (EMPTY_OBJ as P);
    this.context = context || EMPTY_OBJ; // context should not be mutable
  }

  public forceUpdate(callback?: Function) {
    if (this.$UN) {
      return;
    }
    // Do not allow double render during force update
    queueStateChanges(this, {} as any, callback, true);
  }

  public setState<K extends keyof S>(
    newState: ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null) | (Pick<S, K> | S | null),
    callback?: () => void
  ): void {
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
    }
  }

  public componentDidMount?(): void;

  public componentWillMount?(): void;

  public componentWillReceiveProps?(nextProps: P, nextContext: any): void;

  public shouldComponentUpdate?(nextProps: P, nextState: S, context: any): boolean;

  public componentWillUpdate?(nextProps: P, nextState: S, context: any): void;

  public componentDidUpdate?(prevProps: P, prevState: S, snapshot: any): void;

  public componentWillUnmount?(): void;

  public getChildContext?(): void;

  public getSnapshotBeforeUpdate?(prevProps: P, prevState: S): any;

  public static defaultProps?: any;

  public static getDerivedStateFromProps?(nextProps: any, state: any): any;

  public render(_nextProps: P, _nextState: S, _nextContext: any): InfernoNode | undefined {
    return null;
  }
}
