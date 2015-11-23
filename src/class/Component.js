import applyState from './applyState';
import queueStateChanges from './queueStateChanges';

class Component {
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

export default Component;