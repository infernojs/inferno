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

/// <reference path="../node_modules/@types/sinon/index.d.ts" />

declare module 'sinon' {
	export default Sinon;
}