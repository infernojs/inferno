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

declare module 'inferno' {
	export function findDOMNode(node: any): any
}

declare module 'inferno-create-class' {
	function createClass(component: any): any
	export = createClass;
}

declare module 'inferno-create-element' {
	function createElement(component: any, props: any, ...children): any
	export = createElement;
}
