declare module 'inferno' {
	export function createVNode(flags, type?, props?, children?, key?, ref?, noNormalise?: boolean): any;
	export function cloneVNode(node, props?, ...children);
	export function render(...rest);
	export function findDOMNode(node: any): any;
	export function createRenderer(...rest);
	export function disableRecycling(...rest);
	export const NO_OP;
}

declare module 'inferno-component' {
	class Component<P, C> {
		refs?: any;
		state?: any;
		props?: P;
		context?: C;
		_unmounted?: boolean;
		constructor (props?: P, context?: C);
		componentWillReact();
		componentWillReceiveProps? (nextProps: P, nextContext: C): void;
		forceUpdate (): void;
		setState (v: Object, cb?: () => {}): boolean;
		isPrototypeOf (v: Object): void;
	}
	export default Component;
}

declare module 'inferno-server' {
	export function renderToStaticMarkup(...rest);
	export default function renderToString(...rest);
}

declare module 'inferno-create-class' {
	export default function createClass(component: any): any;
}

declare module 'inferno-create-element' {
	export default function createElement(component: any, props: any, ...children): any;
}

declare module 'lodash/isPlainObject' {
	function isPlainObject(value: any): boolean;
	export = isPlainObject;
}

declare module 'invariant' {
	function invariant(condition: any, message: string): void;
	export = invariant;
}

declare module 'hoist-non-inferno-statics' {
	function hoistStatics(connectClass: any, wrappedComponent: any): {[index: string]: any};
	export = hoistStatics;
}

declare module 'path-to-regexp-es6' {
	function pathToRegExp(routePath: any, keys: any, end: any);
	export default pathToRegExp;
}

declare module 'concat-stream-es6' {
	function concatStream(func?: any);
	export default concatStream;
}

declare module 'history/createBrowserHistory' {
	function createBrowserHistory(options?: any);
	export = createBrowserHistory;
}

declare module 'history/createMemoryHistory' {
	function createMemoryHistory(options?: any);
	export = createMemoryHistory;
}

declare module 'mobx' {
	export function toJS(value: any): any;
	export function observable(value: any): any;
	export function isObservable(value: any, property?: string): boolean;
	export function extendObservable(...rest): any;
	export class Reaction {
		constructor(name?: string, onInvalidate?: any);
		track(param: any): void;
		runReaction();
		dispose();
		getDisposer(): any;
	}
	export const extras: any;
}

declare module 'redux' {
	export function createStore(callback: any): any;
	export function bindActionCreators(actionCreators: any, dispatch: any): any;
}

declare module 'sinon' {
	export function spy(obj: any, event: string): any;
	export function stub(obj: any, event: string, callback: any): any;
	export const assert;
}

declare module 'most' {
	export function map(f?: any, stream?: any): any;
	export function scan(f?: any, initial?: any, stream?: any): any;
}

declare module 'most-subject' {
	export function hold(bufferSize?: number, subject?: any): any;
}

declare module 'lodash/fp' {
	export function curry(obj: any): any;
}

declare module 'union-type-es' {
	export default function (obj: any): any;
}

interface Window { process: any; __karma__: any; }
