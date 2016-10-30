import {ComponentSpec} from './es2015';
import Component from 'inferno-component';
import { isNullOrUndef } from '../shared';

// don't autobind these methods since they already have guaranteed context.
const AUTOBIND_BLACKLIST = {
	constructor: 1,
	render: 1,
	shouldComponentUpdate: 1,
	componentWillRecieveProps: 1,
	componentWillUpdate: 1,
	componentDidUpdate: 1,
	componentWillMount: 1,
	componentDidMount: 1,
	componentWillUnmount: 1,
	componentDidUnmount: 1
};

function extend(base, props, all?) {
	for (let key in props) {
		if (all === true || !isNullOrUndef(props[key])) {
			base[key] = props[key];
		}
	}
	return base;
}

function bindAll(ctx) {
	for (let i in ctx) {
		const v = ctx[i];
		if (typeof v === 'function' && !v.__bound && !AUTOBIND_BLACKLIST[i]) {
			(ctx[i] = v.bind(ctx)).__bound = true;
		}
	}
}

export default function createClass<P, S>(obj: ComponentSpec<P, S>) {
	return class Cl extends Component<P, S> {
		static displayName = obj.displayName || 'Component';
		static propTypes = obj.propTypes;
		static defaultProps = obj.getDefaultProps ? obj.getDefaultProps() : undefined;

		constructor(props) {
			super(props);
			extend(this, obj);
			bindAll(this);
			if (obj.getInitialState) {
				this.state = obj.getInitialState.call(this);
			}
		}
	};
}
