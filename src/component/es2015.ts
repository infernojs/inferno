import Lifecycle from './../DOM/lifecycle';
import { isNullOrUndef, NO_OP, throwError, isFunction } from '../shared';
import { createVPlaceholder } from './../core/shapes';

const noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';
const componentCallbackQueue = new Map();

function addToQueue(component, force, callback) {
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

function queueStateChanges(component, newState, callback) {
	if (isFunction(newState)) {
		newState = newState(component.state);
	}
	for (let stateKey in newState) {
		component._pendingState[stateKey] = newState[stateKey];
	}
	if (!component._pendingSetState) {
		component._pendingSetState = true;
		if (component._processingSetState || callback) {
			addToQueue(component, false, callback);
		} else {
			component._processingSetState = true;
			applyState(component, false, callback);
			component._processingSetState = false;
		}
	} else {
		component.state = Object.assign({}, component.state, component._pendingState);
		component._pendingState = {};
	}
}

function applyState(component, force, callback) {
	if ((!component._deferSetState || force) && !component._blockRender) {
		component._pendingSetState = false;
		const pendingState = component._pendingState;
		const prevState = component.state;
		const nextState = Object.assign({}, prevState, pendingState);
		const props = component.props;
		const context = component.context;

		component._pendingState = {};
		let nextInput = component._updateComponent(prevState, nextState, props, props, context, force);

		if (nextInput === NO_OP) {
			nextInput = component._lastInput;
		} else if (isNullOrUndef(nextInput)) {
			nextInput = createVPlaceholder();
		}
		const lastInput = component._lastInput;
		const parentDom = lastInput.dom.parentNode;
		const subLifecycle = new Lifecycle();
		let childContext = component.getChildContext();

		if (!isNullOrUndef(childContext)) {
			childContext = Object.assign({}, context, component._childContext, childContext);
		} else {
			childContext = Object.assign({}, context, component._childContext);
		}
		component._lastInput = nextInput;
		component._patch(lastInput, nextInput, parentDom, subLifecycle, childContext, component._isSVG, false);
		component._vComponent.dom = nextInput.dom;
		component._componentToDOMNodeMap.set(component, nextInput.dom);
		component.componentDidUpdate(props, prevState);
		subLifecycle.trigger();
		if (!isNullOrUndef(callback)) {
			callback();
		}
	}
}

export default class Component {
	state: any = {};
	refs: any = {};
	props;
	context;
	componentDidMount;
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

	constructor(props, context) {
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

	componentDidUpdate() {
	}

	shouldComponentUpdate(nextProps?, nextState?, context?) {
		return true;
	}

	componentWillReceiveProps(nextProps?, context?) {
	}

	componentWillUpdate(nextProps?, nextState?, nextContext?) {
	}

	getChildContext() {
	}

	_updateComponent(prevState, nextState, prevProps, nextProps, context, force): any {
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
