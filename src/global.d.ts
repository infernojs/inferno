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

declare module 'lodash/isPlainObject' {
	function isPlainObject(value: any): boolean;
	export = isPlainObject;
}

declare module 'union-type-es' {
	export default function (obj: any): any;
}

interface Window {
	process: any;
	__karma__: any;
	mocha: any;
}

/* tslint:disable */
declare namespace process {
	export interface env {
		NODE_ENV: any;
	}
}
/* tslint:enable */

declare module 'concat-stream-es6' {
	function concatStream(func?: any);
	export default concatStream;
}