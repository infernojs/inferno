// Make sure u use EMPTY_OBJ from 'inferno', otherwise it'll be a different reference
import { EMPTY_OBJ, options, Props, VNode } from 'inferno';
import {
	combineFrom,
	ERROR_MSG,
	isBrowser,
	isFunction,
	isNullOrUndef,
	isUndefined,
	NO_OP,
	throwError,
    LifecycleClass
} from 'inferno-shared';


/* Add ES6 component implementations for Inferno-core to use */
options.component.create = createClassComponentInstance;
options.component.patch = patchClassComponent;

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

function addToQueue(component: Component<any, any>, force: boolean, callback?: Function): void {
	const queueStateChange = component._queueStateChange;

	if (queueStateChange !== null) {
		queueStateChange(component, force, callback);
	}
}

function queueStateChanges<P, S>(component: Component<P, S>, newState: S, callback?: Function): void {
	if (isFunction(newState)) {
		newState = newState(component.state, component.props, component.context);
	}
	let pending = component._pendingState;

	if (pending === null) {
		component._pendingState = pending = newState;
	} else {
		for (const stateKey in newState) {
			pending[ stateKey ] = newState[ stateKey ];
		}
	}

	if (isBrowser && !component._pendingSetState && !component._blockRender) {
		addToQueue(component, false, callback);
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
		if (!isNullOrUndef(callback) && component._blockRender) {
			(component._lifecycle as any).addListener(callback.bind(component));
		}
	}
}

function createClassComponentInstance(vNode: VNode, Component, props: Props, context: Object, isSVG: boolean, lifecycle: LifecycleClass) {
	if (isUndefined(context)) {
		context = EMPTY_OBJ; // Context should not be mutable
	}
	const instance = new Component(props, context);
	vNode.children = instance;
	instance._blockSetState = false;
	instance.context = context;
	if (instance.props === EMPTY_OBJ) {
		instance.props = props;
	}
	// setState callbacks must fire after render is done when called from componentWillReceiveProps or componentWillMount
	instance._lifecycle = lifecycle;

	instance._unmounted = false;
	instance._pendingSetState = true;
	instance._isSVG = isSVG;
	if (!isUndefined(instance.componentWillMount)) {
		instance._blockRender = true;
		instance.componentWillMount();
		instance._blockRender = false;
	}

	let childContext;
	if (!isUndefined(instance.getChildContext)) {
		childContext = instance.getChildContext();
	}

	if (isNullOrUndef(childContext)) {
		instance._childContext = context;
	} else {
		instance._childContext = combineFrom(context, childContext);
	}

	if (!isNull(options.beforeRender)) {
		options.beforeRender(instance);
	}

	let input = instance.render(props, instance.state, context);

	if (!isNull(options.afterRender)) {
		options.afterRender(instance);
	}
	if (isArray(input)) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
		}
		throwError();
	} else if (isInvalid(input)) {
		input = createVoidVNode();
	} else if (isStringOrNumber(input)) {
		input = createTextVNode(input, null);
	} else {
		if (input.dom) {
			input = directClone(input);
		}
		if (input.flags & VNodeFlags.Component) {
			// if we have an input that is also a component, we run into a tricky situation
			// where the root vNode needs to always have the correct DOM entry
			// so we break monomorphism on our input and supply it our vNode as parentVNode
			// we can optimise this in the future, but this gets us out of a lot of issues
			input.parentVNode = vNode;
		}
	}
	instance._pendingSetState = false;
	instance._lastInput = input;
	return instance;
}

function patchClassComponent(lastVNode, nextVNode, parentDom, lifecycle: LifecycleClass, context, isSVG: boolean, isRecycling: boolean) {
	const instance = lastVNode.children;
	instance._updating = true;

	if (instance._unmounted) {
		return true;
	} else {
		const hasComponentDidUpdate = !isUndefined(instance.componentDidUpdate);
		const nextState = instance.state;
		// When component has componentDidUpdate hook, we need to clone lastState or will be modified by reference during update
		const lastState = hasComponentDidUpdate ? combineFrom(nextState, null) : nextState;
		const lastProps = instance.props;
		let childContext;
		if (!isUndefined(instance.getChildContext)) {
			childContext = instance.getChildContext();
		}

		nextVNode.children = instance;
		instance._isSVG = isSVG;
		if (isNullOrUndef(childContext)) {
			childContext = context;
		} else {
			childContext = combineFrom(context, childContext);
		}
		const lastInput = instance._lastInput;
		let nextInput = instance._updateComponent(lastState, nextState, lastProps, nextVNode.props || EMPTY_OBJ, context, false, false);
		let didUpdate = true;

		instance._childContext = childContext;
		if (isInvalid(nextInput)) {
			nextInput = createVoidVNode();
		} else if (nextInput === NO_OP) {
			nextInput = lastInput;
			didUpdate = false;
		} else if (isStringOrNumber(nextInput)) {
			nextInput = createTextVNode(nextInput, null);
		} else if (isArray(nextInput)) {
			if (process.env.NODE_ENV !== 'production') {
				throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
			}
			throwError();
		} else if (isObject(nextInput)) {
			if (!isNull((nextInput as VNode).dom)) {
				nextInput = directClone(nextInput as VNode);
			}
		}
		if (nextInput.flags & VNodeFlags.Component) {
			nextInput.parentVNode = nextVNode;
		} else if (lastInput.flags & VNodeFlags.Component) {
			lastInput.parentVNode = nextVNode;
		}
		instance._lastInput = nextInput;
		instance._vNode = nextVNode;
		if (didUpdate) {
			patch(lastInput, nextInput, parentDom, lifecycle, childContext, isSVG, isRecycling);
			if (hasComponentDidUpdate) {
				instance.componentDidUpdate(lastProps, lastState);
			}
			if (!isNull(options.afterUpdate)) {
				options.afterUpdate(nextVNode);
			}
			if (options.findDOMNodeEnabled) {
				componentToDOMNodeMap.set(instance, nextInput.dom);
			}
		}
		nextVNode.dom = nextInput.dom;
	}
	instance._updating = false;

	return false;
}


let alreadyWarned = false;

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
	public _vNode: VNode|null = null;
	public _unmounted = false;
	public _lifecycle = null;
	public _childContext = null;
	public _isSVG = false;
	public _queueStateChange = null;

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
		if (this._unmounted || !isBrowser) {
			return;
		}

		applyState(this, true, callback);
	}

	public setState(newState, callback?: Function) {
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

	public setStateSync(newState) {
		if (process.env.NODE_ENV !== 'production') {
			if (!alreadyWarned) {
				alreadyWarned = true;
				// tslint:disable-next-line:no-console
				console.warn('Inferno WARNING: setStateSync has been deprecated and will be removed in next release. Use setState instead.');
			}
		}
		this.setState(newState);
	}

	public _updateComponent(prevState: S, nextState: S, prevProps: P & Props, nextProps: P & Props, context: any, force: boolean, fromSetState: boolean): VNode|string {
		if (this._unmounted === true) {
			if (process.env.NODE_ENV !== 'production') {
				throwError(noOp);
			}
			throwError();
		}
		if ((prevProps !== nextProps || nextProps === EMPTY_OBJ) || prevState !== nextState || force) {
			if (prevProps !== nextProps || nextProps === EMPTY_OBJ) {
				if (!isUndefined(this.componentWillReceiveProps) && !fromSetState) {
					// keep a copy of state before componentWillReceiveProps
					const beforeState = combineFrom(this.state) as any;
					this._blockRender = true;
					this.componentWillReceiveProps(nextProps, context);
					this._blockRender = false;
					const afterState = this.state;
					if (beforeState !== afterState) {
						// if state changed in componentWillReceiveProps, reassign the beforeState
						this.state = beforeState;
						// set the afterState as pending state so the change gets picked up below
						this._pendingSetState = true;
						this._pendingState = afterState;
					}
				}
				if (this._pendingSetState) {
					nextState = combineFrom(nextState, this._pendingState) as any;
					this._pendingSetState = false;
					this._pendingState = null;
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

	// tslint:disable-next-line:no-empty
	public render(nextProps?: P, nextState?, nextContext?): any {}
}
