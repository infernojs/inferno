import type { Inferno, InfernoNode } from './types';
import { IComponent, VNode } from './types';
import { combineFrom, isFunction, isNullOrUndef, throwError } from 'inferno-shared';
import { updateClassComponent } from '../DOM/patching';
import { AnimationQueues, callAll, callAllAnimationHooks, EMPTY_OBJ, findDOMFromVNode, renderCheck } from '../DOM/utils/common';

const COMPONENTS_QUEUE: Component<any, any>[] = [];

const nextTick =
  typeof Promise !== 'undefined'
    ? Promise.resolve().then.bind(Promise.resolve())
    : function (a) {
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
      if (COMPONENTS_QUEUE.length === 0) {
        applyState(component, force);
        if (isFunction(callback)) {
          callback.call(component);
        }
        return;
      }
    }
    if (COMPONENTS_QUEUE.indexOf(component) === -1) {
      COMPONENTS_QUEUE.push(component);
    }
    if (force) {
      component.$F = true;
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

  for (let i = 0; i < queue.length; ++i) {
    queue[i].call(component);
  }

  component.$QU = null;
}

export function rerender() {
  let component;
  microTaskPending = false;

  while ((component = COMPONENTS_QUEUE.shift())) {
    if (!component.$UN) {
      const force = component.$F;
      component.$F = false;
      applyState(component, force);

      if (component.$QU) {
        callSetStateCallbacks(component);
      }
    }
  }
}

function applyState<P, S>(component: Component<P, S>, force: boolean): void {
  if (force || !component.$BR) {
    const pendingState = component.$PS;

    component.$PS = null;

    const lifecycle: Function[] = [];
    const animations: AnimationQueues = new AnimationQueues();

    renderCheck.v = true;

    updateClassComponent(
      component,
      combineFrom(component.state, pendingState),
      component.props,
      (findDOMFromVNode(component.$LI, true) as Element).parentNode as Element,
      component.context,
      component.$SVG,
      force,
      null,
      lifecycle,
      animations
    );
    callAll(lifecycle);
    callAllAnimationHooks(animations.componentDidAppear);

    renderCheck.v = false;
  } else {
    component.state = component.$PS as any;
    component.$PS = null;
  }
}
export type ComponentType<P = {}> = Component<P> | Inferno.StatelessComponent<P>;

export abstract class Component<P = {}, S = {}> implements IComponent<P, S> {
  // Public
  public state: Readonly<S | null> = null;
  public props: Readonly<{ children?: InfernoNode }> & Readonly<P>;
  public context: any;
  public displayName?: string;

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
  public $F: boolean = false; // Force update flag

  constructor(props?: P, context?: any) {
    this.props = (props || EMPTY_OBJ) as Readonly<{ children?: InfernoNode }> & Readonly<P>;
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
    newState: ((prevState: Readonly<S>, props: Readonly<{ children?: InfernoNode } & P>) => Pick<S, K> | S | null) | (Pick<S, K> | S | null),
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

  public componentWillReceiveProps?(nextProps: Readonly<{ children?: InfernoNode } & P>, nextContext: any): void;

  public shouldComponentUpdate?(nextProps: Readonly<{ children?: InfernoNode } & P>, nextState: Readonly<S>, context: any): boolean;

  public componentWillUpdate?(nextProps: Readonly<{ children?: InfernoNode } & P>, nextState: Readonly<S>, context: any): void;

  public componentDidUpdate?(prevProps: Readonly<{ children?: InfernoNode } & P>, prevState: Readonly<S>, snapshot: any): void;

  public componentWillUnmount?(): void;

  public componentDidAppear?(domNode: Element): void;

  public componentWillDisappear?(domNode: Element, callback: Function): void;

  public componentWillMove?(parentVNode: VNode, parentDOM: Element, dom: Element): void;

  public getChildContext?(): void;

  public getSnapshotBeforeUpdate?(prevProps: Readonly<{ children?: InfernoNode } & P>, prevState: Readonly<S>): any;

  public static defaultProps?: {} | null = null;

  public static getDerivedStateFromProps?(nextProps: any, state: any): any;

  // @ts-expect-error TS6133
  public render(props: Readonly<{ children?: InfernoNode } & P>, state: Readonly<S>, context: any): InfernoNode {
    return null;
  }
}
