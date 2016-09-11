import Lifecycle from './../DOM/lifecycle';
import { isNullOrUndef, NO_OP, throwError } from './../core/utils';
import { createVPlaceholder } from './../core/shapes.ts';

const noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';

// Copy of the util from dom/util, otherwise it makes massive bundles
function getActiveNode() {
	return document.activeElement;
}

// Copy of the util from dom/util, otherwise it makes massive bundles
function resetActiveNode(activeNode) {
	if (activeNode !== document.body && document.activeElement !== activeNode) {
		activeNode.focus(); // TODO: verify are we doing new focus event, if user has focus listener this might trigger it
	}
}

function queueStateChanges(component, newState, callback) {
	for (let stateKey in newState) {
		component._pendingState[stateKey] = newState[stateKey];
	}
	if (!component._pendingSetState) {
		component._pendingSetState = true;
		applyState(component, false, callback);
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

		component._pendingState = {};
		let nextInput = component._updateComponent(prevState, nextState, props, props, force);

		if (nextInput === NO_OP) {
			nextInput = component._lastInput;
		} else if (isNullOrUndef(nextInput)) {
			nextInput = createVPlaceholder();
		}
		const lastInput = component._lastInput;
		const parentDom = lastInput.dom.parentNode;
		const activeNode = getActiveNode();
		const subLifecycle = new Lifecycle();

		component._patch(lastInput, nextInput, parentDom, subLifecycle, component.context, component._isSVG, false);
		component._lastInput = nextInput;
		component._vComponent.dom = nextInput.dom;
		component._componentToDOMNodeMap.set(component, nextInput.dom);
		component.componentDidUpdate(props, prevState);
		subLifecycle.trigger();
		if (!isNullOrUndef(callback)) {
			callback();
		}
		resetActiveNode(activeNode);
	}
}

export default class Component {
	constructor(props, context) {
		/** @type {object} */
		this.props = props || {};

		/** @type {object} */
		this.state = {};

		/** @type {object} */
		this.refs = {};
		this._blockRender = false;
		this._blockSetState = false;
		this._deferSetState = false;
		this._pendingSetState = false;
		this._pendingState = {};
		this._lastInput = null;
		this._vComponent = null;
		this._unmounted = true;
		this.context = context || {};
		this._childContext = null;
		this._patch = null;
		this._isSVG = false;
		this._componentToDOMNodeMap = null;
		if (!this.componentDidMount) {
			this.componentDidMount = null;
		}
	}

	render() {
	}

	forceUpdate(callback) {
		if (this._unmounted) {
			throw Error(noOp);
		}
		applyState(this, true, callback);
	}
	setState(newState, callback) {
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

	shouldComponentUpdate() {
		return true;
	}

	componentWillReceiveProps() {
	}

	componentWillUpdate() {
	}

	getChildContext() {
	}

	_updateComponent(prevState, nextState, prevProps, nextProps, force) {
		if (this._unmounted === true) {
			throw new Error('You can\'t update an unmounted component!');
		}
		if (!isNullOrUndef(nextProps) && isNullOrUndef(nextProps.children)) {
			nextProps.children = prevProps.children;
		}
		if (prevProps !== nextProps || prevState !== nextState || force) {
			if (prevProps !== nextProps) {
				this._blockRender = true;
				this.componentWillReceiveProps(nextProps);
				this._blockRender = false;
				if (this._pendingSetState) {
					nextState = Object.assign({}, nextState, this._pendingState);
					this._pendingSetState = false;
					this._pendingState = {};
				}
			}
			const shouldUpdate = this.shouldComponentUpdate(nextProps, nextState);

			if (shouldUpdate !== false || force) {
				this._blockSetState = true;
				this.componentWillUpdate(nextProps, nextState);
				this._blockSetState = false;
				this.props = nextProps;
				this.state = nextState;
				return this.render();
			}
		}
		return NO_OP;
	}
}
