import Component from './es2015';
import { isNullOrUndefined } from '../core/utils';

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

function F() {
}

function extend(base, props, all) {
	for (let key in props) {
		if (all === true || !isNullOrUndefined(props[key])) {
			base[key] = props[key];
		}
	}
	return base;
}

function bindAll(ctx) {
	for (let i in ctx) {
		const v = ctx[i];
		if (typeof v === 'function' && !v.__bound && !AUTOBIND_BLACKLIST.hasOwnProperty(i)) {
			(ctx[i] = v.bind(ctx)).__bound = true;
		}
	}
}

export default function createClass(obj) {
	function Cl(props) {
		extend(this, obj);
		Component.call(this, props);
		bindAll(this);
		if (this.getInitialState) {
			this.state = this.getInitialState();
		}
	}

	F.prototype = Component.prototype;
	Cl.prototype = new F();
	Cl.prototype.constructor = Cl;
	Cl.displayName = obj.displayName || 'Component';
	return Cl;
}
