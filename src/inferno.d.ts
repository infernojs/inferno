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

declare module 'redux' {
	export function bindActionCreators(actionCreation: any, dispatch: (action: any) => any): any;
}

declare module 'path-to-regexp' {
	function pathToRegExp(routePath: any, keys: Array, end: any);
	export = pathToRegExp;
}

declare module 'sinon' {
	export function spy(obj: any, event: string): any;
	export const assert;
}

declare module 'sinon.assert' {
	export function calledOnce(obj: any): any;
}
