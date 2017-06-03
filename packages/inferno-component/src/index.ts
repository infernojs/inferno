// Make sure u use EMPTY_OBJ from 'inferno', otherwise it'll be a different reference
import { EMPTY_OBJ, internal_DOMNodeMap, internal_patch, options, Props, VNode} from 'inferno';
import {
	combineFrom,
	ERROR_MSG,
	isBrowser,
	isFunction,
	isNullOrUndef,
	LifecycleClass,
	NO_OP,
	throwError
} from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';

/* Add ES6 component implementations for Inferno-core to use */
options.component.create = createInstance;
options.component.patch = patchComponent;
options.component.flush = flushQueue;

const handleInput = options.component.handleInput;
let noOp = ERROR_MSG;

if (process.env.NODE_ENV !== 'production') {
	noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';
}

export interface ComponentLifecycle<P, S> {
	componentDidMount?(): void;
	componentWillMount?(): void;
	componentWillReceiveProps?(nextProps: P, nextContext: any): void;
	shouldComponentUpdate?(nextProps: P, nextState: S, nextContext: any): boolean;
	componentWillUpdate?(nextProps: P, nextState: S, nextContext: any): void;
	componentDidUpdate?(prevProps: P, prevState: S, prevContext: any): void;
	componentWillUnmount?(): void;
}

function queueStateChanges<P, S>(component: Component<P, S>, newState: S, callback?: Function): void {
	if (isFunction(newState)) {
		newState = (newState as any)(component.state, component.props, component.context) as S;
	}
	let pending = component._pendingState;

	if (isNullOrUndef(pending)) {
		component._pendingState = pending = newState;
	} else {
		for (const stateKey in newState) {
			pending[ stateKey ] = newState[ stateKey ];
		}
	}

	if (isBrowser && !component._pendingSetState && !component._blockRender) {
		queueStateChange(component, false, callback);
	} else {
		const state = component.state;

		if (state === null) {
			component.state = pending;
		} else {
			for (const key in pending) {
				state[ key ] = pending[ key ];
			}
		}

		component._pendingState = null;
		if (component._blockRender && isFunction(callback)) {
			component._lifecycle.addListener(callback.bind(component));
		}
	}
}

function createInstance(vNode: VNode, Component, props: Props, context: Object, isSVG: boolean, lifecycle: LifecycleClass) {
	const instance = new Component(props, context) as Component<any, any>;
	vNode.children = instance as any;
	instance._blockSetState = false;
	instance.context = context;
	if (instance.props === EMPTY_OBJ) {
		instance.props = props;
	}
	// setState callbacks must fire after render is done when called from componentWillReceiveProps or componentWillMount
	instance._lifecycle = lifecycle;
	instance._pendingSetState = true;
	instance._isSVG = isSVG;
	if (isFunction(instance.componentWillMount)) {
		instance._blockRender = true;
		instance.componentWillMount();
		instance._blockRender = false;
	}

	let childContext;
	if (isFunction(instance.getChildContext)) {
		childContext = instance.getChildContext();
	}

	if (isNullOrUndef(childContext)) {
		instance._childContext = context;
	} else {
		instance._childContext = combineFrom(context, childContext);
	}

	if (isFunction(options.beforeRender)) {
		options.beforeRender(instance);
	}

	const renderOutput = instance.render(props, instance.state, context);

	if (isFunction(options.afterRender)) {
		options.afterRender(instance);
	}

	instance._pendingSetState = false;
	instance._lastInput = handleInput(renderOutput, vNode);
	instance._vNode = vNode;
	return instance;
}

function updateComponent<P, S>(component: Component<P, S>, prevState: S, nextState: S, prevProps: P & Props, nextProps: P & Props, context: any, force: boolean, fromSetState: boolean): VNode|string {
	if (component._unmounted === true) {
		if (process.env.NODE_ENV !== 'production') {
			throwError(noOp);
		}
		throwError();
	}
	if ((prevProps !== nextProps || nextProps === EMPTY_OBJ) || prevState !== nextState || force) {
		if (prevProps !== nextProps || nextProps === EMPTY_OBJ) {
			if (!fromSetState && isFunction(component.componentWillReceiveProps)) {
				// keep a copy of state before componentWillReceiveProps
				const beforeState = combineFrom(component.state) as any;
				component._blockRender = true;
				component.componentWillReceiveProps(nextProps, context);
				component._blockRender = false;
				const afterState = component.state;
				if (beforeState !== afterState) {
					// if state changed in componentWillReceiveProps, reassign the beforeState
					component.state = beforeState;
					// set the afterState as pending state so the change gets picked up below
					component._pendingSetState = true;
					component._pendingState = afterState;
				}
			}
			if (component._pendingSetState) {
				nextState = combineFrom(nextState, component._pendingState) as any;
				component._pendingSetState = false;
				component._pendingState = null;
			}
		}

		/* Update if scu is not defined, or it returns truthy value or force */
		// When force is true we should not call scu
		const hasSCU = isFunction(component.shouldComponentUpdate);
		if (force || !hasSCU || (hasSCU && (component.shouldComponentUpdate as Function)(nextProps, nextState, context) !== false)) {
			if (isFunction(component.componentWillUpdate)) {
				component._blockSetState = true;
				component.componentWillUpdate(nextProps, nextState, context);
				component._blockSetState = false;
			}

			component.props = nextProps;
			component.state = nextState;
			component.context = context;

			if (isFunction(options.beforeRender)) {
				options.beforeRender(component);
			}
			const render = component.render(nextProps, nextState, context);

			if (isFunction(options.afterRender)) {
				options.afterRender(component);
			}

			return render;
		} else {
			component.props = nextProps;
			component.state = nextState;
			component.context = context;
		}
	}
	return NO_OP;
}

function patchComponent(lastVNode, nextVNode, parentDom, lifecycle: LifecycleClass, context, isSVG: boolean, isRecycling: boolean) {
	const instance = lastVNode.children as Component<any, any>;
	instance._vNode = nextVNode;
	instance._updating = true;

	if (instance._unmounted) {
		return true;
	} else {
		nextVNode.dom  = handleUpdate(instance, instance.state, nextVNode.props || EMPTY_OBJ, context, false, false);
		nextVNode.children = instance;
	}
	instance._updating = false;

	return false;
}

const resolvedPromise = Promise.resolve();
const componentFlushQueue: any[] = [];

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

function handleUpdate(component, nextState, nextProps, context, force, fromSetState) {
	let nextInput;
	const hasComponentDidUpdateIsFunction = isFunction(component.componentDidUpdate);
	// When component has componentDidUpdate hook, we need to clone lastState or will be modified by reference during update
	const prevState = hasComponentDidUpdateIsFunction ? combineFrom(nextState, null) : component.state;
	const lastInput = component._lastInput as VNode;
	const prevProps = component.props;
	const renderOutput = updateComponent(component, prevState, nextState, prevProps, nextProps, context, force, fromSetState);
	const vNode = component._vNode as VNode;
	const parentDom = (lastInput.dom && lastInput.dom.parentNode) || (lastInput.dom = vNode.dom);
	// debugger;
	if (renderOutput !== NO_OP) {
		nextInput = handleInput(renderOutput, vNode);
		let childContext;

		if (isFunction(component.getChildContext)) {
			childContext = component.getChildContext();
		}

		if (isNullOrUndef(childContext)) {
			childContext = component._childContext;
		} else {
			childContext = combineFrom(context, childContext as any);
		}

		const lifeCycle = component._lifecycle;

		if (nextInput.flags & VNodeFlags.Component) {
			nextInput.parentVNode = vNode;
		} else if (lastInput.flags & VNodeFlags.Component) {
			lastInput.parentVNode = vNode;
		}

		internal_patch(lastInput, nextInput as VNode, parentDom as Element, lifeCycle, childContext, component._isSVG, false);
		if (fromSetState) {
			lifeCycle.trigger();
		}

		if (hasComponentDidUpdateIsFunction) {
			component.componentDidUpdate(prevProps, prevState, context);
		}
		if (isFunction(options.afterUpdate)) {
			options.afterUpdate(vNode);
		}
		if (options.findDOMNodeEnabled) {
			internal_DOMNodeMap.set(component, nextInput.dom);
		}
	} else {
		nextInput = lastInput;
	}

	if (nextInput.flags & VNodeFlags.Component) {
		nextInput.parentVNode = vNode;
	} else if (lastInput.flags & VNodeFlags.Component) {
		lastInput.parentVNode = vNode;
	}

	component._lastInput = nextInput as VNode;
	const dom = vNode.dom = (nextInput as VNode).dom as Element;

	if (options.findDOMNodeEnabled) {
		internal_DOMNodeMap.set(component, (nextInput as VNode).dom);
	}

	return dom;
}

function applyState<P, S>(component: Component<P, S>, force: boolean, callback?: Function): void {
	if (component._unmounted) {
		return;
	}
	if (force || !component._blockRender) {
		const pendingState = component._pendingState;
		component._pendingSetState = false;
		component._pendingState = null;
		updateParentComponentVNodes(
			component._vNode,
			handleUpdate(
				component,
				combineFrom(component.state, pendingState),
				component.props,
				component.context,
				force,
				true
			)
		);
	} else {
		component.state = component._pendingState as S;
		component._pendingState = null;
	}
	if (isFunction(callback)) {
		callback.call(component);
	}
}

let globalFlushPending = false;

function loopCallbacks() {
	const callbacks = this.__FCB;

	for (let i = 0, len = callbacks.length; i < len; i++) {
		callbacks[i].call(this);
	}

	this.__FCB = null;
}

function flushQueue() {
	options.component.rendering = true;
	const length = componentFlushQueue.length;

	if (length > 0) {
		for (let i = 0; i < length; i++) {
			const component = componentFlushQueue[i];

			applyState(component, false, (component.__FCB !== null ? loopCallbacks : undefined));
			component.__FP = false; // Flush no longer pending for this component
		}
		componentFlushQueue.length = 0;
	}
	globalFlushPending = false;
}

function queueStateChange(component, force, callback) {
	if (options.component.rendering) {
		if (!component.__FP) {
			component.__FP = true;
			componentFlushQueue.push(component);
		}

		if (isFunction(callback)) {
			let callbacks = component.__FCB;

			if (callbacks === null) {
				component.__FCB = callbacks = [callback];
			} else {
				callbacks.push(callback);
			}
		}

		if (!globalFlushPending) {
			globalFlushPending = true;
			resolvedPromise.then(flushQueue);
		}
	} else {
		options.component.rendering = true;
		applyState(component, force, callback);
		flushQueue();
		options.component.rendering = false;
	}
}

export default class Component<P, S> implements ComponentLifecycle<P, S> {
	public static defaultProps: {};
	public state: S|null = null;
	public props: P & Props;
	public context: any;
	public _blockRender = false;
	public _blockSetState = true;
	public _pendingSetState = false;
	public _pendingState: S|null = null;
	public _lastInput: any = null;
	public _vNode: VNode;
	public _unmounted: boolean = false;
	public _lifecycle: LifecycleClass;
	public _childContext: object|null = null;
	public _isSVG = false;
	public _updating: boolean = true;
	public _updateComponent: Function; // TODO: Remove

	public __FP: boolean = false; // Flush Pending
	public __FCB: Function[]|null = null; // Flush callbacks for this component

	constructor(props?: P, context?: any) {
		/** @type {object} */
		this.props = props || (EMPTY_OBJ as P);

		/** @type {object} */
		this.context = context || EMPTY_OBJ; // context should not be mutable
		this._updateComponent = updateComponent;
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
		if (this._unmounted || this._updating || !isBrowser) {
			return;
		}

		queueStateChange(this, true, callback);
	}

	public setState(newState: S|Function, callback?: Function) {
		if (this._unmounted) {
			return;
		}
		if (!this._blockSetState) {
			queueStateChanges(this, newState, callback);
		} else {
			if (process.env.NODE_ENV !== 'production') {
				throwError('cannot update state via setState() in componentWillUpdate() or constructor.');
			}
			throwError();
		}
	}

	// tslint:disable-next-line:no-empty
	public render(nextProps?: P, nextState?, nextContext?): any {}
}
