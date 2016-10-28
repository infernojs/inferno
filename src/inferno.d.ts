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

declare module 'sinon' {
	export function spy(obj: any, event: string): any;
	export const assert;
}

declare module 'sinon.assert' {
	export function calledOnce(obj: any): any;
}
