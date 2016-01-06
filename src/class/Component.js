import queueStateChanges from '../core/queueStateChanges';

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
	constructor( props/* , context */ ) {
		/** @type {object} */
		this.props = props || {};
		this._blockRender = false;
		this._blockSetState = false;
		this._deferSetState = false;
		this._pendingSetState = false;
		this._pendingState = {};
		this._lastRender = null;
		/** @type {object} */
			this.state = {};
		this.context = {};
	}
	render() {}
	forceUpdate() {}
	setState( newState/* , callback */ ) {
		// TODO the callback
		if ( this._blockSetState === false ) {
			queueStateChanges( this, newState );
		} else {
			throw Error( 'Inferno Error: Cannot update state via setState() in componentWillUpdate()' );
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
}

export default Component;
