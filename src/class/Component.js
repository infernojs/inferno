function applyState(component) {
	requestAnimationFrame(() => {
		if(component._deferSetState === false) {
			component._pendingSetState = false;
			for (let stateKey in component._pendingState) {
				component.state[stateKey] = component._pendingState[stateKey];
			}
			component._pendingState = {};
			component._pendingSetState = false;
		} else {
			applyState(component);
		}
	});
}

function queueStateChanges(component, newState) {
	for (let stateKey in newState) {
		component._pendingState = newState[stateKey];
	}
	if(component._pendingSetState == false) {
		component._pendingSetState = true;
		applyState(component);
	}
}

export default class Component {
	constructor(props, context) {
		this.props = props;
		this.context = context;
		this._blockSetState = false;
		this._pendingState = {};
		this._deferSetState = false;
		this.state = {};
	}
	render() {}
	forceUpdate() {}
	setState(newState) {
		if(this._blockSetState === false) {
			queueStateChanges(this, newState);
		} else {
			throw Error("Inferno Error: Cannot update state via setState() in componentWillReceiveProps()");
		}
		this.forceUpdate();
	}
	replaceState(newState) {
		this.state = newState;
		this.forceUpdate();
	}
	componentDidMount() {}
	componentWillMount() {}
	componentWillUnmount() {}
	componentDidUpdate() {}
	shouldComponentUpdate() { return true; }
	componentWillReceiveProps() {}
	componentWillUpdate() {}
}
