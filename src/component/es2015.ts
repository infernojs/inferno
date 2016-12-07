import { NO_OP, createVNode, EMPTY_OBJ } from 'inferno';
import {
	isArray,
	isFunction,
	isInvalid,
	isNullOrUndef,
	throwError,
	ERROR_MSG
} from '../shared';
import {
	VNodeFlags
} from '../core/shapes';

import Lifecycle from './../DOM/lifecycle';

let noOp = ERROR_MSG;

if (process.env.NODE_ENV !== 'production') {
	noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';
}
const componentCallbackQueue = new Map();

// when a components root VNode is also a component, we can run into issues
// this will recursively look for vNode.parentNode if the VNode is a component
function updateParentComponentVNodes(vNode, dom) {
	if (vNode.flags & VNodeFlags.Component) {
		const parentVNode = vNode.parentVNode;

		if (parentVNode) {
			parentVNode.dom = dom;
			updateParentComponentVNodes(parentVNode, dom);
		}
	}
}

export interface ComponentLifecycle<P, S> {
	componentDidMount?: () => void;
	componentWillMount?(): void;
	componentWillReceiveProps?(nextProps: P, nextContext: any): void;
	shouldComponentUpdate?(nextProps: P, nextState: S, nextContext: any): boolean;
	componentWillUpdate?(nextProps: P, nextState: S, nextContext: any): void;
	componentDidUpdate?(prevProps: P, prevState: S, prevContext: any): void;
	componentWillUnmount?(): void;
}

export interface Mixin<P, S> extends ComponentLifecycle<P, S> {
	statics?: {
		[key: string]: any;
	};

	displayName?: string;
	propTypes?: {[index: string]: Function};

	getDefaultProps?(): P;
	getInitialState?(): S;
}

export interface ComponentSpec<P, S> extends Mixin<P, S> {
	mixins?: any;
	[propertyName: string]: any;
	render(props?, context?): any;
}

// this is in shapes too, but we don't want to import from shapes as it will pull in a duplicate of createVNode
function createVoidVNode() {
	return createVNode(VNodeFlags.Void);
}

function addToQueue(component: Component<any, any>, force, callback): void {
	// TODO this function needs to be revised and improved on
	let queue: any = componentCallbackQueue.get(component);

	if (!queue) {
		queue = [];
		componentCallbackQueue.set(component, queue);
		Promise.resolve().then(() => {
			applyState(component, force, () => {
				for (let i = 0; i < queue.length; i++) {
					queue[i]();
				}
			});
			componentCallbackQueue.delete(component);
			component._processingSetState = false;
		});
	}
	if (callback) {
		queue.push(
			callback
		);
	}
}

function queueStateChanges(component: Component<any, any>, newState, callback): void {
	if (isFunction(newState)) {
		newState = newState(component.state);
	}
	for (let stateKey in newState) {
		component._pendingState[stateKey] = newState[stateKey];
	}
	if (!component._pendingSetState) {
		if (component._processingSetState || callback) {
			addToQueue(component, false, callback);
		} else {
			component._pendingSetState = true;
			component._processingSetState = true;
			applyState(component, false, callback);
			component._processingSetState = false;
		}
	} else {
		component.state = Object.assign({}, component.state, component._pendingState);
		component._pendingState = {};
	}
}

function applyState(component: Component<any, any>, force, callback): void {
	if ((!component._deferSetState || force) && !component._blockRender) {
		component._pendingSetState = false;
		const pendingState = component._pendingState;
		const prevState = component.state;
		const nextState = Object.assign({}, prevState, pendingState);
		const props = component.props;
		const context = component.context;

		component._pendingState = {};
		let nextInput = component._updateComponent(prevState, nextState, props, props, context, force);
		let didUpdate = true;

		if (isInvalid(nextInput)) {
			nextInput = createVoidVNode();
		} else if (isArray(nextInput)) {
			if (process.env.NODE_ENV !== 'production') {
				throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
			}
			throwError();
		} else if (nextInput === NO_OP) {
			nextInput = component._lastInput;
			didUpdate = false;
		}

		const lastInput = component._lastInput;
		const parentDom = lastInput.dom.parentNode;

		component._lastInput = nextInput;
		if (didUpdate) {
			let subLifecycle: Lifecycle = component._lifecycle;

			if (!subLifecycle) {
				subLifecycle = new Lifecycle();
			} else {
				subLifecycle.listeners = [];
			}
			component._lifecycle = subLifecycle;
			let childContext = component.getChildContext();

			if (!isNullOrUndef(childContext)) {
				childContext = Object.assign({}, context, component._childContext, childContext);
			} else {
				childContext = Object.assign({}, context, component._childContext);
			}

			component._patch(lastInput, nextInput, parentDom, subLifecycle, childContext, component._isSVG, false);
			subLifecycle.trigger();
			component.componentDidUpdate(props, prevState);
		}
		const vNode = component._vNode;
		const dom = vNode.dom = nextInput.dom;
		const componentToDOMNodeMap = component._componentToDOMNodeMap;

		componentToDOMNodeMap && componentToDOMNodeMap.set(component, nextInput.dom);
		updateParentComponentVNodes(vNode, dom);
		if (!isNullOrUndef(callback)) {
			callback();
		}
	}
}

export default class Component<P, S> implements ComponentLifecycle<P, S> {
	static defaultProps: any;
	state: S = {} as S;
	refs: any = {};
	props: P & {children?: any};
	context: any;
	_beforeRender: any;
	_afterRender: any;
	_processingSetState = false;
	_blockRender = false;
	_ignoreSetState = false;
	_blockSetState = false;
	_deferSetState = false;
	_pendingSetState = false;
	_pendingState = {};
	_lastInput = null;
	_vNode = null;
	_unmounted = true;
	_devToolsStatus = null;
	_devToolsId = null;
	_lifecycle = null;
	_childContext = null;
	_patch = null;
	_isSVG = false;
	_componentToDOMNodeMap = null;

	constructor(props?: P, context?: any) {
		/** @type {object} */
		this.props = props || (EMPTY_OBJ as P);

		/** @type {object} */
		this.context = context || {};

		if (!this.componentDidMount) {
			this.componentDidMount = null;
		}
	}

	render(nextProps?: P, nextState?, nextContext?) {
	}

	forceUpdate(callback?) {
		if (this._unmounted) {
			throw Error(noOp);
		}
		applyState(this, true, callback);
	}

	setState(newState, callback?) {
		if (this._unmounted) {
			throw Error(noOp);
		}
		if (!this._blockSetState) {
			if (!this._ignoreSetState) {
				queueStateChanges(this, newState, callback);
			}
		} else {
			if (process.env.NODE_ENV !== 'production') {
				throwError('cannot update state via setState() in componentWillUpdate().');
			}
			throwError();
		}
	}

	componentWillMount() {
	}

	componentDidMount() {
	}

	componentWillUnmount() {
	}

	componentDidUpdate(prevProps: P, prevState: S, prevContext?: any) {
	}

	shouldComponentUpdate(nextProps?: P, nextState?: S, context?: any) {
		return true;
	}

	componentWillReceiveProps(nextProps?: P, context?: any) {
	}

	componentWillUpdate(nextProps?: P, nextState?: S, nextContext?: any) {
	}

	getChildContext() {
	}

	_updateComponent(prevState: S, nextState: S, prevProps: P & {children: any}, nextProps: P & {children: any}, context: any, force: boolean): any {
		if (this._unmounted === true) {
			if (process.env.NODE_ENV !== 'production') {
				throwError(noOp);
			}
			throwError();
		}
		if ((prevProps !== nextProps || nextProps === EMPTY_OBJ) || prevState !== nextState || force) {
			if (prevProps !== nextProps || nextProps === EMPTY_OBJ) {
				this._blockRender = true;
				this.componentWillReceiveProps(nextProps, context);
				this._blockRender = false;
				if (this._pendingSetState) {
					nextState = Object.assign({}, nextState, this._pendingState);
					this._pendingSetState = false;
					this._pendingState = {};
				}
			}
			const shouldUpdate = this.shouldComponentUpdate(nextProps, nextState, context);

			if (shouldUpdate !== false || force) {
				this._blockSetState = true;
				this.componentWillUpdate(nextProps, nextState, context);
				this._blockSetState = false;
				this.props = nextProps;
				const state = this.state = nextState;

				this.context = context;
				this._beforeRender && this._beforeRender();
				const render = this.render(nextProps, state, context);

				this._afterRender && this._afterRender();
				return render;
			}
		}
		return NO_OP;
	}
}
