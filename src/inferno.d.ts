declare module 'inferno' {
	export function createOptVElement(...rest);
	export function createOptBlueprint(...rest);
	export function createStaticVElement(...rest);
	export function createVElement(...rest);
	export function createVFragment(...rest);
	export function createVPlaceholder(...rest);
	export function createVComponent(type, props, key?, hooks?, ref?);
	export function createVText(...rest);
	export function cloneVNode(...rest);
	export function ValueTypes(...rest);
	export function ChildrenTypes(...rest);
	export function NodeTypes(...rest);
	export function NO_OP(...rest);
	export function render(...rest);
	export function findDOMNode(node: any): any;
	export function createRenderer(...rest);
	export function disableRecycling(...rest);
	export function convertVOptElementToVElement(...rest);
}

declare module 'inferno-component' {
	class Component<P, C> {
		refs?: any;
		state?: any;
		props?: P;
		context?: C;
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
	function createClass(component: any): any
	export = createClass;
}

declare module 'inferno-create-element' {
	function createElement(component: any, props: any, ...children): any
	export = createElement;
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

declare module 'path-to-regexp' {
	function pathToRegExp(routePath: any, keys: any, end: any);
	export = pathToRegExp;
}

declare module 'concat-stream' {
	function concatStream(func?: any);
	export = concatStream;
}

declare module 'history/createBrowserHistory' {
	function createBrowserHistory(options?: any);
	export = createBrowserHistory;
}


declare module 'history/createMemoryHistory' {
	function createMemoryHistory(options?: any);
	export = createMemoryHistory;
}

declare module 'sinon' {
	export function spy(obj: any, event: string): any;
	export function stub(obj: any, event: string, callback: any): any;
	export const assert;
}

declare module 'sinon.assert' {
	export function calledOnce(obj: any): any;
}
