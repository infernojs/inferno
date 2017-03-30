// Make sure u use EMPTY_OBJ from 'inferno', otherwise it'll be a different reference
import { EMPTY_OBJ, createVNode, options, VNode, Props } from 'inferno';
import VNodeFlags from 'inferno-vnode-flags';
import {
	ERROR_MSG,
	isArray,
	isBrowser,
	isFunction,
	isInvalid,
	isNullOrUndef,
	isStringOrNumber,
	Lifecycle,
	NO_OP,
	throwError,
	combineFrom,
	isUndefined
} from 'inferno-shared';

let noOp = ERROR_MSG;

if (process.env.NODE_ENV !== 'production') {
	noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';
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
	if (vNode.flags & VNodeFlags.Component) {
		const parentVNode = vNode.parentVNode;

		if (parentVNode) {
			parentVNode.dom = dom;
			updateParentComponentVNodes(parentVNode, dom);
		}
	}
}

const resolvedPromise = Promise.resolve();

function addToQueue(component: Component<any, any>, force: boolean, callback?: Function): void {
	// TODO this function needs to be revised and improved on
	let queue: any = componentCallbackQueue.get(component);

	if (!queue) {
		queue = [];
		componentCallbackQueue.set(component, queue);
		resolvedPromise.then(() => {
			componentCallbackQueue.delete(component);
			component._updating = true;
			applyState(component, force, () => {
				for (let i = 0, len = queue.length; i < len; i++) {
					queue[i]();
				}
			});
			component._updating = false;
		});
	}
	if (callback) {
		queue.push(
			callback
		);
	}
}

function queueStateChanges<P, S>(component: Component<P, S>, newState, callback: Function, sync: boolean): void {
	if (isFunction(newState)) {
		newState = newState(component.state, component.props, component.context);
	}
	for (const stateKey in newState) {
		component._pendingState[stateKey] = newState[stateKey];
	}
	if (isBrowser && !component._pendingSetState && !component._blockRender) {
		if (sync && !component._updating) {
			component._pendingSetState = true;
			component._updating = true;
			applyState(component, false, callback);
			component._updating = false;
		} else {
			addToQueue(component, false, callback);
		}
	} else {
		const pending = component._pendingState;
		const state = component.state;

		for (const key in pending) {
			state[key] = pending[key];
		}
		component._pendingState = {};
		if (callback && component._blockRender) {
			component._lifecycle.addListener(callback);
		}
	}
}

function applyState<P, S>(component: Component<P, S>, force: boolean, callback: Function): void {
	if (component._unmounted) {
		return;
	}
	if (force || !component._blockRender) {
		component._pendingSetState = false;
		const pendingState = component._pendingState;
		const prevState = component.state;
		const nextState = combineFrom(prevState, pendingState) as S;
		const props = component.props as P;
		const context = component.context;

		component._pendingState = {};
		let nextInput = component._updateComponent(prevState, nextState, props, props, context, force, true);
		let didUpdate = true;

		if (isInvalid(nextInput)) {
			nextInput = createVNode(VNodeFlags.Void);
		} else if (nextInput === NO_OP) {
			nextInput = component._lastInput;
			didUpdate = false;
		} else if (isStringOrNumber(nextInput)) {
			nextInput = createVNode(VNodeFlags.Text, null, null, nextInput);
		} else if (isArray(nextInput)) {
			if (process.env.NODE_ENV !== 'production') {
				throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
			}
			throwError();
		}

		const lastInput = component._lastInput;
		const vNode = component._vNode;
		const parentDom = (lastInput.dom && lastInput.dom.parentNode) || (lastInput.dom = vNode.dom);

		component._lastInput = nextInput;
		if (didUpdate) {
			let childContext,
					subLifecycle = component._lifecycle;

			if (!subLifecycle) {
				subLifecycle = new Lifecycle();
			} else {
				subLifecycle.listeners = [];
			}
			component._lifecycle = subLifecycle;

			if (!isUndefined(component.getChildContext)) {
				childContext = component.getChildContext();
			}

			if (isNullOrUndef(childContext)) {
				childContext = component._childContext;
			} else {
				childContext = combineFrom(context, childContext as any);
			}

			component._patch(lastInput, nextInput, parentDom, subLifecycle, childContext, component._isSVG, false);
			subLifecycle.trigger();

			if (!isUndefined(component.componentDidUpdate)) {
				component.componentDidUpdate(props, prevState, context);
			}
			options.afterUpdate && options.afterUpdate(vNode);
		}
		const dom = vNode.dom = nextInput.dom;
		const componentToDOMNodeMap = component._componentToDOMNodeMap;

		componentToDOMNodeMap && componentToDOMNodeMap.set(component, nextInput.dom);
		updateParentComponentVNodes(vNode, dom);
	} else {
		component.state = (component._pendingState as S);
		component._pendingState = {};
	}
	if (!isNullOrUndef(callback)) {
		callback();
	}
}

export default class Component<P, S> implements ComponentLifecycle<P, S> {
	static defaultProps: {};
	state: S = {} as S;
	props: P & Props;
	context: any;
	_blockRender = false;
	_blockSetState = false;
	_pendingSetState = false;
	_pendingState = {};
	_lastInput = null;
	_vNode = null;
	_unmounted = false;
	_lifecycle = null;
	_childContext = null;
	_patch = null;
	_isSVG = false;
	_componentToDOMNodeMap = null;
	_updating = false;

	constructor(props?: P, context?: any) {
		/** @type {object} */
		this.props = props || (EMPTY_OBJ as P);

		/** @type {object} */
		this.context = context || EMPTY_OBJ; // context should not be mutable
	}

	// LifeCycle methods
	componentDidMount? (): void;
	componentWillMount? (): void;
	componentWillReceiveProps? (nextProps: P, nextContext: any): void;
	shouldComponentUpdate? (nextProps: P, nextState: S, nextContext: any): boolean;
	componentWillUpdate? (nextProps: P, nextState: S, nextContext: any): void;
	componentDidUpdate? (prevProps: P, prevState: S, prevContext: any): void;
	componentWillUnmount? (): void;
	getChildContext? (): void;
	render(nextProps?: P, nextState?, nextContext?) {}

	forceUpdate(callback?: Function) {
		if (this._unmounted || !isBrowser) {
			return;
		}

		applyState(this, true, callback);
	}

	setState(newState, callback?: Function) {
		if (this._unmounted) {
			return;
		}
		if (!this._blockSetState) {
			queueStateChanges(this, newState, callback, false);
		} else {
			if (process.env.NODE_ENV !== 'production') {
				throwError('cannot update state via setState() in componentWillUpdate().');
			}
			throwError();
		}
	}

	setStateSync(newState) {
		if (this._unmounted) {
			return;
		}
		if (!this._blockSetState) {
			queueStateChanges(this, newState, null, true);
		} else {
			if (process.env.NODE_ENV !== 'production') {
				throwError('cannot update state via setState() in componentWillUpdate().');
			}
			throwError();
		}
	}

	_updateComponent(
		prevState: S,
		nextState: S,
		prevProps: P & Props,
		nextProps: P & Props,
		context: any,
		force: boolean,
		fromSetState: boolean
	): any {
		if (this._unmounted === true) {
			if (process.env.NODE_ENV !== 'production') {
				throwError(noOp);
			}
			throwError();
		}
		if ((prevProps !== nextProps || nextProps === EMPTY_OBJ) || prevState !== nextState || force) {
			if (prevProps !== nextProps || nextProps === EMPTY_OBJ) {
				if (!isUndefined(this.componentWillReceiveProps) && !fromSetState ) {
					this._blockRender = true;
					this.componentWillReceiveProps(nextProps, context);
					this._blockRender = false;
				}
				if (this._pendingSetState) {
					nextState = combineFrom(nextState, this._pendingState) as S;
					this._pendingSetState = false;
					this._pendingState = {};
				}
			}

			/* Update if scu is not defined, or it returns truthy value or force */
			if (isUndefined(this.shouldComponentUpdate) || this.shouldComponentUpdate(nextProps, nextState, context) || force) {
				if (!isUndefined(this.componentWillUpdate)) {
					this._blockSetState = true;
					this.componentWillUpdate(nextProps, nextState, context);
					this._blockSetState = false;
				}

				this.props = nextProps;
				this.state = nextState;
				this.context = context;

				if (options.beforeRender) {
					options.beforeRender(this);
				}
				const render = this.render(nextProps, nextState, context);

				if (options.afterRender) {
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
}
