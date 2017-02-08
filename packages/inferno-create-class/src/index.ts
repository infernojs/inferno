import { isFunction, isNullOrUndef, isUndefined, isObject, throwError } from 'inferno-shared';
import Component, { ComponentLifecycle } from 'inferno-component';

export interface Mixin<P, S> extends ComponentLifecycle<P, S> {
	statics?: {
		[key: string]: any;
	};
	mixins?: any;

	displayName?: string;
	propTypes?: {[index: string]: Function};

	getDefaultProps?(): P;
	getInitialState?(): S;
}

export interface ComponentClass<P, S> extends Mixin<P, S> {
	new (props?: P, context?: any): Component<P, S>;
	propTypes?: {};
	contextTypes?: {};
	childContextTypes?: {};
	defaultProps?: P;
	displayName?: string;
}

export interface ComponentSpec<P, S> extends Mixin<P, S> {
	[propertyName: string]: any;
	render(props?, context?): any;
}

export interface ClassicComponent<P, S> extends Component<P, S> {
	replaceState(nextState: S, callback?: () => any): void;
	isMounted(): boolean;
	getInitialState?(): S;
}

export interface ClassicComponentClass<P, S> extends ComponentClass<P, S> {
	new (props?: P, context?: any): ClassicComponent<P, S>;
	getDefaultProps?(): P;
}

// don't autobind these methods since they already have guaranteed context.
const AUTOBIND_BLACKLIST = {
	constructor: 1,
	render: 1,
	shouldComponentUpdate: 1,
	componentWillReceiveProps: 1,
	componentWillUpdate: 1,
	componentDidUpdate: 1,
	componentWillMount: 1,
	componentDidMount: 1,
	componentWillUnmount: 1,
	componentDidUnmount: 1
};

function extend(base, props, all?: boolean) {
	for (let key in props) {
		if (all === true || !isNullOrUndef(props[key])) {
			base[key] = props[key];
		}
	}
	return base;
}

function bindAll<P, S>(ctx: Component<P, S>) {
	for (let i in ctx) {
		const v = ctx[i];
		if (typeof v === 'function' && !v.__bound && !AUTOBIND_BLACKLIST[i]) {
			(ctx[i] = v.bind(ctx)).__bound = true;
		}
	}
}

function collateMixins(mixins: Function[] | any[], keyed = {}): any {
	for (let i = 0, len = mixins.length; i < len; i++) {
		const mixin = mixins[i];

		// Surprise: Mixins can have mixins
		if (mixin.mixins) {
			// Recursively collate sub-mixins
			collateMixins(mixin.mixins, keyed);
		}

		for (let key in mixin as Function[]) {
			if (mixin.hasOwnProperty(key) && typeof mixin[key] === 'function') {
				(keyed[key] || (keyed[key] = [])).push(mixin[key]);
			}
		}
	}
	return keyed;
}

function multihook<P, S>(inst: Component<P, S>, hooks: Function[], mergeFn?: Function): any {
	return function() {
		let ret;

		for (let i = 0, len = hooks.length; i < len; i ++) {
			const hook = hooks[i];
			let r = hook.apply(inst, arguments);

			if (mergeFn) {
				ret = mergeFn(ret, r);
			} else if (isUndefined(r)) {
				ret = r;
			}
		}

		return ret;
	};
}

function mergeNoDupes(previous: any, current: any) {
	if (!isUndefined(current)) {
		if (!isObject(current)) {
			throwError('Expected Mixin to return value to be an object or null.');
		}

		if (!previous) {
			previous = {};
		}

		for (let key in current) {
			if (current.hasOwnProperty(key)) {
				if (previous.hasOwnProperty(key)) {
					throwError(`Mixins return duplicate key ${key} in their return values`);
				}

				previous[key] = current[key];
			}
		}
	}
	return previous;
}

function applyMixin<P, S>(key: string, inst: Component<P, S>, mixin: Function[]): void {
	const hooks = isUndefined(inst[key]) ? mixin : mixin.concat(inst[key]);

	if (key === 'getDefaultProps' || key === 'getInitialState' || key === 'getChildContext') {
		inst[key] = multihook<P, S>(inst, hooks, mergeNoDupes);
	} else {
		inst[key] = multihook<P, S>(inst, hooks);
	}
}

function applyMixins(inst: any, mixins: Function[] | any[]) {
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

export default function createClass<P, S>(obj: ComponentSpec<P, S>): ClassicComponentClass<P, S> {
	class Cl extends Component<P, S> {
		static defaultProps;
		static displayName = obj.displayName || 'Component';
		static propTypes = obj.propTypes;
		static mixins = obj.mixins && collateMixins(obj.mixins);
		static getDefaultProps = obj.getDefaultProps;
		static getInitialState = obj.getInitialState;

		constructor(props, context) {
			super(props, context);
			extend(this, obj);
			bindAll(this);
			if (Cl.getInitialState) {
				this.state = Cl.getInitialState.call(this);
			}
		}

		public replaceState(nextState: S, callback?: () => any) {
			this.setState(nextState, callback);
		}

		public isMounted(): boolean {
			return !this._unmounted;
		};

	}

	if (obj.mixins) {
		applyMixins(Cl, collateMixins(obj.mixins));
	}

	if (obj.statics) {
		extend(Cl, obj.statics);
	}

	Cl.getInitialState = isUndefined(Cl.getInitialState) ? undefined : Cl.getInitialState;
	Cl.defaultProps = isUndefined(Cl.getDefaultProps) ? undefined : Cl.getDefaultProps();

	return Cl;
}
