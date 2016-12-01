import { isFunction, isNullOrUndef, isUndefined } from '../shared';

import Component from 'inferno-component';
import {ComponentSpec} from './es2015';

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

function collateMixins(mixins) {
	let keyed = {};
	for (let i = 0; i < mixins.lenth; i++) {
		const mixin = mixins[i];

		for (let key in mixin) {
			if (mixin.hasOwnProperty(key) && typeof mixin[key] === 'function') {
				(keyed[key] || (keyed[key] = [])).push(mixin[key]);
			}
		}
	}
	return keyed;
}

function applyMixin(key, inst, mixin) {
	const original = inst[key];

	inst[key] = function () {
		let ret;

		for (let i = 0; i < mixin.length; i++) {
			const method = mixin[i];
			const _ret = method.apply(inst, arguments);

			if (!isUndefined(_ret)) {
				ret = _ret;
			}
		}
		if (original) {
			const _ret = original.call(inst);

			if (!isUndefined(_ret)) {
                ret = _ret;
            }
		}
		return ret;
	};
}

function applyMixins(inst, mixins) {
	for (let key in mixins) {
		if (mixins.hasOwnProperty(key)) {
			const mixin = mixins[key];

			if (isFunction(mixin[0])) {
				applyMixin(key, inst, mixin);
			} else {
				inst[key] = mixin;
			}
		}
	}
}

export default function createClass<P, S>(obj: ComponentSpec<P, S>) {
	class Cl extends Component<P, S> {
		static displayName = obj.displayName || 'Component';
		static propTypes = obj.propTypes;
		static defaultProps = obj.getDefaultProps ? obj.getDefaultProps() : undefined;
		static mixins = obj.mixins && collateMixins(obj.mixins);

		constructor(props) {
			super(props);
			extend(this, obj);
			if (Cl.mixins) {
				applyMixins(this, Cl.mixins);
			}
			bindAll(this);
			if (obj.getInitialState) {
				this.state = obj.getInitialState.call(this);
			}
		}

		public isMounted = function() { return !this._unmounted; };
	}
	if (obj.statics) {
		extend(Cl, obj.statics);
	}
	return Cl;
}
