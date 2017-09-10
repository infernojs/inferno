/**
 * @module Inferno
 */ /** TypeDoc Comment */

import VNodeFlags from "inferno-vnode-flags";
import { options, Props, VNode } from "./implementation";
import {
  combineFrom,
  ERROR_MSG,
  isFunction,
  isNullOrUndef,
  NO_OP,
  throwError
} from "inferno-shared";
import { updateClassComponent } from "../DOM/patching";
import { EMPTY_OBJ } from "../DOM/utils/common";

let noOp = ERROR_MSG;

if (process.env.NODE_ENV !== "production") {
  noOp =
    "Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.";
}

const componentCallbackQueue: Map<any, Function[]> = new Map();

export interface ComponentLifecycle<P, S> {
  componentDidMount?(): void;
  componentWillMount?(): void;
  componentWillReceiveProps?(nextProps: P, nextContext: any): void;
  shouldComponentUpdate?(nextProps: P, nextState: S, nextContext: any): boolean;
  componentWillUpdate?(nextProps: P, nextState: S, nextContext: any): void;
  componentDidUpdate?(prevProps: P, prevState: S, prevContext: any): void;
  componentWillUnmount?(): void;
}

// when a components root VNode is also a component, we can run into issues
// this will recursively look for vNode.parentNode if the VNode is a component
function updateParentComponentVNodes(vNode: VNode, dom: Element) {
  if ((vNode.flags & VNodeFlags.Component) > 0) {
    const parentVNode = vNode.parentVNode;

    if (parentVNode) {
      parentVNode.dom = dom;
      updateParentComponentVNodes(parentVNode, dom);
    }
  }
}

const resolvedPromise = Promise.resolve();

function addToQueue(
  component: Component<any, any>,
  force: boolean,
  callback?: Function
): void {
  let queue: any = componentCallbackQueue.get(component);

  if (queue === void 0) {
    queue = [];
    componentCallbackQueue.set(component, queue);
    resolvedPromise.then(() => {
      componentCallbackQueue.delete(component);
      component._updating = true;
      applyState(component, force, () => {
        for (let i = 0, len = queue.length; i < len; i++) {
          queue[i].call(component);
        }
      });
      component._updating = false;
    });
  }
  if (isFunction(callback)) {
    queue.push(callback);
  }
}

function queueStateChanges<P, S>(
  component: Component<P, S>,
  newState: S,
  callback?: Function
): void {
  if (isFunction(newState)) {
    newState = newState(component.state, component.props, component.context);
  }
  const pending = component._pendingState;

  if (isNullOrUndef(pending)) {
    component._pendingState = newState;
  } else {
    for (const stateKey in newState) {
      pending[stateKey] = newState[stateKey];
    }
  }

  if (!component._pendingSetState && !component._blockRender) {
    if (!component._updating) {
      component._pendingSetState = true;
      component._updating = true;
      applyState(component, false, callback);
      component._updating = false;
    } else {
      addToQueue(component, false, callback);
    }
  } else {
    component._pendingSetState = true;
    if (component._blockRender && isFunction(callback)) {
      (component._lifecycle as any).push(callback.bind(component));
    }
  }
}

function applyState<P, S>(
  component: Component<P, S>,
  force: boolean,
  callback?: Function
): void {
  if (component._unmounted) {
    return;
  }
  if (force || !component._blockRender) {
    component._pendingSetState = false;
    const pendingState = component._pendingState;
    const prevState = component.state;
    const nextState = combineFrom(prevState, pendingState) as any;
    const props = component.props as P;
    const context = component.context;

    component._pendingState = null;
    // TODO: This is unreliable and bad code, refactor it away
    const lastInput = component._lastInput as VNode;
    const parentDom = lastInput.dom && lastInput.dom.parentNode;

    updateClassComponent(
      component,
      nextState,
      component._vNode as VNode,
      props,
      parentDom,
      component._lifecycle as any,
      context,
      component._isSVG,
      force,
      true
    );
    if (component._unmounted) {
      return;
    }
    updateParentComponentVNodes(
      component._vNode as VNode,
      component._lastInput.dom
    );
    let listener;
    const lifeCycle = component._lifecycle as any;

    while ((listener = lifeCycle.shift()) !== undefined) {
      listener();
    }
  } else {
    component.state = component._pendingState as any;
    component._pendingState = null;
  }
  if (isFunction(callback)) {
    callback.call(component);
  }
}

export class Component<P, S> implements ComponentLifecycle<P, S> {
  public static defaultProps: {};
  public state: S | null = null;
  public props: P & Props;
  public context: any;
  public _blockRender = false;
  public _blockSetState = true;
  public _pendingSetState = false;
  public _pendingState: S | null = null;
  public _lastInput: any = null;
  public _vNode: VNode | null = null;
  public _unmounted = false;
  public _lifecycle = null;
  public _childContext = null;
  public _isSVG = false;
  public _updating = true;

  constructor(props?: P, context?: any) {
    /** @type {object} */
    this.props = props || (EMPTY_OBJ as P);

    /** @type {object} */
    this.context = context || EMPTY_OBJ; // context should not be mutable
  }

  // LifeCycle methods
  public componentDidMount?(): void;

  public componentWillMount?(): void;

  public componentWillReceiveProps?(nextProps: P, nextContext: any): void;

  public shouldComponentUpdate?(
    nextProps: P,
    nextState: S,
    nextContext: any
  ): boolean;

  public componentWillUpdate?(
    nextProps: P,
    nextState: S,
    nextContext: any
  ): void;

  public componentDidUpdate?(
    prevProps: P,
    prevState: S,
    prevContext: any
  ): void;

  public componentWillUnmount?(): void;

  public getChildContext?(): void;

  public forceUpdate(callback?: Function) {
    if (this._unmounted) {
      return;
    }

    applyState(this, true, callback);
  }

  public setState(newState: { [k in keyof S]?: S[k] }, callback?: Function) {
    if (this._unmounted) {
      return;
    }
    if (!this._blockSetState) {
      queueStateChanges(this, newState, callback);
    } else {
      // Development warning
      if (process.env.NODE_ENV !== "production") {
        throwError(
          "cannot update state via setState() in componentWillUpdate() or constructor."
        );
      }
      return;
    }
  }

  public _updateComponent(
    prevState: S,
    nextState: S,
    prevProps: P & Props,
    nextProps: P & Props,
    context: any,
    force: boolean,
    fromSetState: boolean
  ): VNode | string {
    if (this._unmounted === true) {
      if (process.env.NODE_ENV !== "production") {
        throwError(noOp);
      }
      return NO_OP;
    }
    if (
      prevProps !== nextProps ||
      nextProps === EMPTY_OBJ ||
      prevState !== nextState ||
      force
    ) {
      if (prevProps !== nextProps || nextProps === EMPTY_OBJ) {
        if (!fromSetState && isFunction(this.componentWillReceiveProps)) {
          this._blockRender = true;
          this.componentWillReceiveProps(nextProps, context);
          // If this component was removed during its own update do nothing...
          if (this._unmounted) {
            return NO_OP;
          }
          this._blockRender = false;
        }
        if (this._pendingSetState) {
          nextState = combineFrom(nextState, this._pendingState) as any;
          this._pendingSetState = false;
          this._pendingState = null;
        }
      }

      /* Update if scu is not defined, or it returns truthy value or force */
      const hasSCU = isFunction(this.shouldComponentUpdate);

      if (
        force ||
        !hasSCU ||
        (hasSCU &&
          (this.shouldComponentUpdate as Function)(
            nextProps,
            nextState,
            context
          ))
      ) {
        if (isFunction(this.componentWillUpdate)) {
          this._blockSetState = true;
          this.componentWillUpdate(nextProps, nextState, context);
          this._blockSetState = false;
        }

        this.props = nextProps;
        this.state = nextState;
        this.context = context;

        if (isFunction(options.beforeRender)) {
          options.beforeRender(this);
        }
        const render = this.render(nextProps, nextState, context);

        if (isFunction(options.afterRender)) {
          options.afterRender(this);
        }

        return render;
      } else {
        this.props = nextProps;
        this.state = nextState;
        this.context = context;
      }
    }
    return NO_OP;
  }

  // tslint:disable-next-line:no-empty
  public render(nextProps?: P, nextState?, nextContext?): any {}
}
