/**
 * @module Inferno
 */
/** TypeDoc Comment */

import { VNodeFlags } from 'inferno-vnode-flags';
import { Props, VNode } from './implementation';
import { combineFrom, isFunction, isNull, isNullOrUndef, throwError } from 'inferno-shared';
import { updateClassComponent } from '../DOM/patching';
import { callAll, EMPTY_OBJ } from '../DOM/utils/common';

const resolvedPromise: any = typeof Promise === 'undefined' ? null : Promise.resolve();

function nextTick(fn) {
  if (resolvedPromise) {
    return resolvedPromise.then(fn);
  }
  return requestAnimationFrame(fn);
}

function queueStateChanges<P, S>(component: Component<P, S>, newState: S | Function, callback?: Function): void {
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
      applyState(component, false, callback);
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
      (component._lifecycle as any).push(callback.bind(component));
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

    updateClassComponent(
      component,
      nextState,
      vNode,
      props,
      parentDom,
      component._lifecycle as any,
      context,
      (vNode.flags & VNodeFlags.SvgElement) > 0,
      force,
      true
    );
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

    if ((component._lifecycle as any).length > 0) {
      callAll(component._lifecycle as any);
    }
  } else {
    component.state = component.$PS as any;
    component.$PS = null;
  }
  if (isFunction(callback)) {
    callback.call(component);
  }
}

export class Component<P, S> {
  // Public
  public static defaultProps: {} | null = null;
  public state: S | null = null;
  public props: P & Props;
  public context: any;

  // Internal properties
  public $BR: boolean = false; // BLOCK RENDER
  public $BS: boolean = true; // BLOCK STATE
  public $PSS: boolean = false; // PENDING SET STATE
  public $PS: S | null = null; // PENDING STATE (PARTIAL or FULL)
  public $LI: any = null; // LAST INPUT
  public $V: VNode | null = null; // VNODE
  public $UN = false; // UNMOUNTED
  public _lifecycle = null; // TODO: Remove this from here, lifecycle should be pure.
  public $CX = null; // CHILDCONTEXT
  public $UPD: boolean = true; // UPDATING
  public $QU: Function[] | null = null; // QUEUE

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

  public shouldComponentUpdate?(nextProps: P, nextState: S, nextContext: any): boolean;

  public componentWillUpdate?(nextProps: P, nextState: S, nextContext: any): void;

  public componentDidUpdate?(prevProps: P, prevState: S, prevContext: any): void;

  public componentWillUnmount?(): void;

  public getChildContext?(): void;

  public forceUpdate(callback?: Function) {
    if (this.$UN) {
      return;
    }

    applyState(this, true, callback);
  }

  public setState(newState: { [k in keyof S]?: S[k] } | Function, callback?: Function) {
    if (this.$UN) {
      return;
    }
    if (!this.$BS) {
      queueStateChanges(this, newState, callback);
    } else {
      // Development warning
      if (process.env.NODE_ENV !== 'production') {
        throwError('cannot update state via setState() in componentWillUpdate() or constructor.');
      }
      return;
    }
  }

  // tslint:disable-next-line:no-empty
  public render(nextProps?: P, nextState?, nextContext?): any {}
}
