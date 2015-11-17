// TODO! Finish this

export default class Component {
	constructor(props, context) {
		this.props = props;
		this.context = context;
		// TODO this.state should not be defined by default
		this.state = {};
	}
	render() {}
	forceUpdate() {}
	setState(newStateItems) {
		for (let stateItem in newStateItems) {
			this.state[stateItem] = newStateItems[stateItem];
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
