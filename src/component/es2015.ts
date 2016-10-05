import Lifecycle from './../DOM/lifecycle';
import {
	isNullOrUndef,
	NO_OP,
	throwError,
	isFunction,
	isArray,
	isInvalid
} from '../shared';
import {
	createVPlaceholder,
	createVFragment
} from './../core/shapes';

const noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';
const componentCallbackQueue = new Map();

export interface ComponentLifecycle<P, S> {
	componentDidMount?: () => void;
	componentWillMount?(): void;
	componentWillReceiveProps?(nextProps: P, nextContext: any): void;
	shouldComponentUpdate?(nextProps: P, nextState: S, nextContext: any): boolean;
	componentWillUpdate?(nextProps: P, nextState: S, nextContext: any): void;
	componentDidUpdate?(prevProps: P, prevState: S, prevContext: any): void;
	componentWillUnmount?(): void;
}

function addToQueue(component: Component<any, any>, force, callback): void {
	// TODO this function needs to be revised and improved on
	let queue: any = componentCallbackQueue.get(component);

	if (!queue) {
		queue = [];
		componentCallbackQueue.set(component, queue);
		requestAnimationFrame(() => {
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
			nextInput = createVPlaceholder();
		} else if (isArray(nextInput)) {
			nextInput = createVFragment(nextInput, null);
		} else if (nextInput === NO_OP) {
			nextInput = component._lastInput;
			didUpdate = false;
		}

		const lastInput = component._lastInput;
		const parentDom = lastInput.dom.parentNode;

		component._lastInput = nextInput;
		if (didUpdate) {
			const subLifecycle = new Lifecycle();
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
		component._vComponent.dom = nextInput.dom;
		component._componentToDOMNodeMap.set(component, nextInput.dom);
		if (!isNullOrUndef(callback)) {
			callback();
		}
	}
}

export default class Component<P, S> implements ComponentLifecycle<P, S> {
	state: any = {};
	refs: any = {};
	props: P & {children: any};
	context: S;
	componentDidMount: any;
	_processingSetState = false;
	_blockRender = false;
	_blockSetState = false;
	_deferSetState = false;
	_pendingSetState = false;
	_pendingState = {};
	_lastInput = null;
	_vComponent = null;
	_unmounted = true;

	_childContext = null;
	_patch = null;
	_isSVG = false;
	_componentToDOMNodeMap = null;

	constructor(props?: any, context?: any) {
		/** @type {object} */
		this.props = props || {};

		/** @type {object} */
		this.context = context || {};

		if (!this.componentDidMount) {
			this.componentDidMount = null;
		}
	}

	render(nextProps?, nextContext?) {
	}

	forceUpdate(callback) {
		if (this._unmounted) {
			throw Error(noOp);
		}
		applyState(this, true, callback);
	}

	setState(newState, callback?) {
		if (this._unmounted) {
			throw Error(noOp);
		}
		if (this._blockSetState === false) {
			queueStateChanges(this, newState, callback);
		} else {
			if (process.env.NODE_ENV !== 'production') {
				throwError('cannot update state via setState() in componentWillUpdate().');
			}
			throwError();
		}
	}

	componentWillMount() {
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
			throw new Error('You can\'t update an unmounted component!');
		}
		if (!isNullOrUndef(nextProps) && isNullOrUndef(nextProps.children)) {
			nextProps.children = prevProps.children;
		}
		if (prevProps !== nextProps || prevState !== nextState || force) {
			if (prevProps !== nextProps) {
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
				this.state = nextState;
				this.context = context;
				return this.render(nextProps, context);
			}
		}
		return NO_OP;
	}
}
