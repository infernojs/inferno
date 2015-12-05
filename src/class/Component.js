import queueStateChanges from '../core/queueStateChanges';

class Component {
	constructor(props, context) {
		this.props = props || {};
		this.context = context;
		this._blockRender = false;
		this._blockSetState = false;
		this._deferSetState = false;
		this._pendingSetState = false;
		this._pendingState = {};
		this.state = {};
	}
	render() {}
	forceUpdate() {}
	setState(newState, callback) {
		// TODO the callback
		if(this._blockSetState === false) {
			queueStateChanges(this, newState);
		} else {
			throw Error("Inferno Error: Cannot update state via setState() in componentWillUpdate()");
		}
	}
	componentDidMount() {}
	componentWillMount() {}
	componentWillUnmount() {}
	componentDidUpdate() {}
	shouldComponentUpdate() { return true; }
	componentWillReceiveProps() {}
	componentWillUpdate() {}
}

export default Component;
