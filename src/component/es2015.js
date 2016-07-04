import Lifecycle from './../DOM/lifecycle';
import {
	isNullOrUndefined,
	isInvalidNode,
	NO_RENDER
} from './../core/utils';
import { createVPlaceholder } from './../core/shapes';

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
		const pendingState = component._pendingState;
		const oldState = component.state;

		component.state = Object.assign({}, oldState, pendingState);
		component._pendingState = {};
	}
}

function applyState(component, force, callback) {
	if (!component._deferSetState || force) {
		component._pendingSetState = false;
		const pendingState = component._pendingState;
		const oldState = component.state;
		const nextState = Object.assign({}, oldState, pendingState);

		component._pendingState = {};
		let nextNode = component._updateComponent(oldState, nextState, component.props, component.props, force);

		if (nextNode === NO_RENDER) {
			nextNode = component._lastNode;
		} else if (isNullOrUndefined(nextNode)) {
			nextNode = createVPlaceholder();
		}
		const lastNode = component._lastNode;
		const parentDom = lastNode.dom.parentNode;
		const activeNode = getActiveNode();
		const subLifecycle = new Lifecycle();

		component._patch(lastNode, nextNode, parentDom, subLifecycle, component.context, component, null);
		component._lastNode = nextNode;
		component._componentToDOMNodeMap.set(component, nextNode.dom);
		component._parentNode.dom = nextNode.dom;

		subLifecycle.trigger();
		if (!isNullOrUndefined(callback)) {
			callback();
		}
		resetActiveNode(activeNode);
	}
}

export default class Component {
	constructor(props) {
		/** @type {object} */
		this.props = props || {};

		/** @type {object} */
		this.state = {};

		/** @type {object} */
		this.refs = {};
		this._blockSetState = false;
		this._deferSetState = false;
		this._pendingSetState = false;
		this._pendingState = {};
		this._parentNode = null;
		this._lastNode = null;
		this._unmounted = true;
		this.context = {};
		this._patch = null;
		this._parentComponent = null;
		this._componentToDOMNodeMap = null;
	}
	render() {}
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
			throw Error('Inferno Warning: Cannot update state via setState() in componentWillUpdate()');
		}
	}
	componentDidMount() {}
	componentWillMount() {}
	componentWillUnmount() {}
	componentDidUpdate() {}
	shouldComponentUpdate() { return true; }
	componentWillReceiveProps() {}
	componentWillUpdate() {}
	getChildContext() {}
	_updateComponent(prevState, nextState, prevProps, nextProps, force) {
		if (this._unmounted === true) {
			this._unmounted = false;
			return false;
		}
		if (!isNullOrUndefined(nextProps) && isNullOrUndefined(nextProps.children)) {
			nextProps.children = prevProps.children;
		}
		if (prevProps !== nextProps || prevState !== nextState || force) {
			if (prevProps !== nextProps) {
				this._blockSetState = true;
				this.componentWillReceiveProps(nextProps);
				this._blockSetState = false;
			}
			const shouldUpdate = this.shouldComponentUpdate(nextProps, nextState);

			if (shouldUpdate !== false) {
				this._blockSetState = true;
				this.componentWillUpdate(nextProps, nextState);
				this._blockSetState = false;
				this.props = nextProps;
				this.state = nextState;
				const node = this.render();

				this.componentDidUpdate(prevProps, prevState);
				return node;
			}
		}
		return NO_RENDER;
	}
}
