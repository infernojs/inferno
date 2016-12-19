/* tslint:disable */
declare module 'hoist-non-inferno-statics' {
	function hoistStatics(connectClass: any, wrappedComponent: any): {[index: string]: any};
	export = hoistStatics;
}

declare module 'concat-stream' {
	function concatStream(func?: any);
	export default concatStream;
}

declare module 'history' {
	export function createBrowserHistory(): any;
	export function createMemoryHistory(): any;
}

declare module 'lodash/fp' {
	export function curry(obj: any): any;
}

declare module 'union-type-es' {
	export default function (obj: any): any;
}

interface Window {
	process: any; 
	__karma__: any; 
	mocha: any;
}

//noinspection TsLint
declare namespace process {
	//noinspection TsLint
	export interface env {
		NODE_ENV: any;
	}
}
