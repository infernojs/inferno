import queueStateChanges from './queueStateChanges';

/** Base Component class, for he ES6 Class method of creating Components
 *	@public
 *
 *	@example
 *	class MyFoo extends Component {
 *		render(props, state) {
 *			return <div />;
 *		}
 *	}
 */
class Component {
	constructor(props) {

		/** @type {object} */
		this.props = props || {};

		/** @type {object} */
		this.state = {};

		this._blockRender = false;
		this._blockSetState = false;
		this._deferSetState = false;
		this._pendingSetState = false;
		this._pendingState = {};
		this._lastRender = null;
		this.context = {};
	}
	render() {}
	forceUpdate() {}
	setState(newState/* , callback */) {
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
	_updateComponent(prevState, nextState, prevProps, nextProps) {
		if (!nextProps.children) {
			nextProps.children = prevProps.children;
		}
		if (prevProps !== nextProps || prevState !== nextState) {
			if (prevProps !== nextProps) {
				this._blockRender = true;
				this.componentWillReceiveProps(nextProps);
				this._blockRender = false;
			}
			const shouldUpdate = this.shouldComponentUpdate(nextProps, nextState);

			if (shouldUpdate) {
				this._blockSetState = true;
				this.componentWillUpdate(nextProps, nextState);
				this._blockSetState = false;
				this.props = nextProps;
				this.state = nextState;
				const newDomNode = this.forceUpdate();

				this.componentDidUpdate(prevProps, prevState);
				return newDomNode;
			}
		}
	}

}

export default Component;
