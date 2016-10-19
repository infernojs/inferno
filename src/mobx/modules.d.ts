declare module 'component/es2015' {
	class Component<P, C> {
		props?: P;
		context?: C;
		constructor (props?: P, context?: C);
		componentWillReceiveProps? (nextProps: P, nextContext: C): void;
		forceUpdate (): void;
		isPrototypeOf (v: Object): boolean;
	}
	export default Component;
}

declare module 'DOM/rendering' {
	export function findDOMNode(node: any): any
}

declare module 'component/createClass' {
	function createClass(component: any): any
	export = createClass;
}

declare module 'factories/createElement' {
	function createElement(component: any, props: any, children: any): any
	export = createElement;
}

declare module 'mobx' {
	export function observable(value: any): any;
	export function isObservable(value: any, property?: string): boolean;
	export class Reaction {
		constructor(name?: string, onInvalidate?: any)
		track(param: any): void
	}
	export const extras: any;
}
