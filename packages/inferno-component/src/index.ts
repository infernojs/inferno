// Make sure u use EMPTY_OBJ from 'inferno', otherwise it'll be a different reference
import { createVNode, EMPTY_OBJ, internal_DOMNodeMap, internal_patch, options, Props, VNode } from 'inferno';
import {
	combineFrom,
	ERROR_MSG,
	isArray,
	isBrowser,
	isFunction,
	isInvalid,
	isNull,
	isNullOrUndef,
	isStringOrNumber,
	isUndefined,
	NO_OP,
	throwError
} from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';

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
