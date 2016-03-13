import Lifecycle from './../core/lifecycle';
import { isNullOrUndefined } from './../core/utils';

function queueStateChanges(component, newState) {
	for (let stateKey in newState) {
		component._pendingState[stateKey] = newState[stateKey];
	}
	if (component._pendingSetState === false) {
		component._pendingSetState = true;
		applyState(component);
	}
}

function applyState(component, force) {
	if (component._deferSetState === false || force) {
		component._pendingSetState = false;
		const pendingState = component._pendingState;
		const oldState = component.state;
		const nextState = { ...oldState, ...pendingState };

		component._pendingState = {};
		const nextNode = component._updateComponent(oldState, nextState, component.props, component.props, force);
		const lastNode = component._lastNode;
		const parentDom = lastNode.dom.parentNode;

		const subLifecycle = new Lifecycle();
		component._diffNodes(lastNode, nextNode, parentDom, subLifecycle, false);
		subLifecycle.addListener(() => {
			subLifecycle.trigger();
		});
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
		this._blockRender = false; // TODO: What is this used for?
		this._blockSetState = false;
		this._deferSetState = false;
		this._pendingSetState = false;
		this._pendingState = {};
		this._lastNode = null;
		this._unmounted = false;
		this.context = {};
		this._diffNodes = null;
	}
	render() {}
	forceUpdate() {
		// TODO: We might need queue forceUpdate like in react
		applyState(this, true);
	}
	setState(newState) {
		// TODO the callback
		if (this._blockSetState === false) {
			queueStateChanges(this, newState);
		} else {
			throw Error('Inferno Error: Cannot update state via setState() in componentWillUpdate()');
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
				this._blockRender = true;
				this.componentWillReceiveProps(nextProps);
				this._blockRender = false;
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
	}
}
