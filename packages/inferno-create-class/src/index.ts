import Component, { ComponentLifecycle } from 'inferno-component';
import { isFunction, isNullOrUndef, isObject, isUndefined, throwError } from 'inferno-shared';

export interface Mixin<P, S> extends ComponentLifecycle<P, S> {
	statics?: {
		[key: string]: any;
	};
	mixins?: any;

	displayName?: string;
	propTypes?: { [index: string]: Function };

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
const AUTOBIND_BLACKLIST = new Set<string>();
AUTOBIND_BLACKLIST.add('constructor');
AUTOBIND_BLACKLIST.add('render');
AUTOBIND_BLACKLIST.add('shouldComponentUpdate');
AUTOBIND_BLACKLIST.add('componentWillReceiveProps');
AUTOBIND_BLACKLIST.add('componentWillUpdate');
AUTOBIND_BLACKLIST.add('componentDidUpdate');
AUTOBIND_BLACKLIST.add('componentWillMount');
AUTOBIND_BLACKLIST.add('componentDidMount');
AUTOBIND_BLACKLIST.add('componentWillUnmount');
AUTOBIND_BLACKLIST.add('componentDidUnmount');

function extend(base, props) {
	for (const key in props) {
		if (!isNullOrUndef(props[ key ])) {
			base[ key ] = props[ key ];
		}
	}
	return base;
}

function bindAll<P, S>(ctx: Component<P, S>) {
	for (const i in ctx) {
		const v = ctx[ i ];
		if (typeof v === 'function' && !v.__bound && !AUTOBIND_BLACKLIST.has(i)) {
			(ctx[ i ] = v.bind(ctx)).__bound = true;
		}
	}
}

function collateMixins(mixins: Function[] | any[], keyed = {}): any {
	for (let i = 0, len = mixins.length; i < len; i++) {
		const mixin = mixins[ i ];

		// Surprise: Mixins can have mixins
		if (mixin.mixins) {
			// Recursively collate sub-mixins
			collateMixins(mixin.mixins, keyed);
		}

		for (const key in mixin as Function[]) {
			if (mixin.hasOwnProperty(key) && typeof mixin[ key ] === 'function') {
				(keyed[ key ] || (keyed[ key ] = [])).push(mixin[ key ]);
			}
		}
	}
	return keyed;
}

function multihook(hooks: Function[], mergeFn?: Function): any {
	return function() {
		let ret;

		for (let i = 0, len = hooks.length; i < len; i++) {
			const hook = hooks[ i ];
			const r = hook.apply(this, arguments);

			if (mergeFn) {
				ret = mergeFn(ret, r);
			} else if (!isUndefined(r)) {
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

		for (const key in current) {
			if (current.hasOwnProperty(key)) {
				if (previous.hasOwnProperty(key)) {
					throwError(`Mixins return duplicate key ${key} in their return values`);
				}

				previous[ key ] = current[ key ];
			}
		}
	}
	return previous;
}

function applyMixin<P, S>(key: string, inst: Component<P, S>, mixin: Function[]): void {
	const hooks = isUndefined(inst[ key ]) ? mixin : mixin.concat(inst[ key ]);

	if (key === 'getDefaultProps' || key === 'getInitialState' || key === 'getChildContext') {
		inst[ key ] = multihook(hooks, mergeNoDupes);
	} else {
		inst[ key ] = multihook(hooks);
	}
}

function applyMixins(Cl: any, mixins: Function[] | any[]) {
	for (const key in mixins) {
		if (mixins.hasOwnProperty(key)) {
			const mixin = mixins[ key ];

			let inst;

			if (key === 'getDefaultProps') {
				inst = Cl;
			} else {
				inst = Cl.prototype;
			}

			if (isFunction(mixin[ 0 ])) {
				applyMixin(key, inst, mixin);
			} else {
				inst[ key ] = mixin;
			}
		}
	}
}

export default function createClass<P, S>(obj: ComponentSpec<P, S>): ClassicComponentClass<P, S> {
	class Cl extends Component<P, S> {
		public static defaultProps;
		public static displayName = obj.displayName || 'Component';
		public static propTypes = obj.propTypes;
		public static mixins = obj.mixins && collateMixins(obj.mixins);
		public static getDefaultProps = obj.getDefaultProps;

		public getInitialState?(): S;

		constructor(props, context) {
			super(props, context);
			bindAll(this);
			if (this.getInitialState) {
				this.state = this.getInitialState();
			}
		}

		public replaceState(nextState: S, callback?: () => any) {
			this.setState(nextState, callback);
		}

		public isMounted(): boolean {
			return !this._unmounted;
		}
	}

	extend(Cl.prototype, obj);

	if (obj.statics) {
		extend(Cl, obj.statics);
	}

	if (obj.mixins) {
		applyMixins(Cl, collateMixins(obj.mixins));
	}

	Cl.defaultProps = isUndefined(Cl.getDefaultProps) ? undefined : Cl.getDefaultProps();

	return Cl;
}
