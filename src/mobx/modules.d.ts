declare module 'inferno-component' {
	export = class Component<props, context> {
		public props;
		public context;
		constructor(props?: any, context?: any)
		componentWillReceiveProps(nextProps?: any)
		forceUpdate()
	};
}

declare module 'inferno-dom' {
	export function findDOMNode(node: any): any
}

declare module 'inferno-create-class' {
	function createClass(component: any): any
	export = createClass;
}

declare module 'inferno-create-element' {
	function createElement(component: any, props: any, children: any): any
	export = createElement;
}

declare module 'mobx' {
	export function isObservable(value: any, property?: string): boolean;
	export class Reaction {
		constructor(name?: string, onInvalidate?: any)
		track(param: any): void
	};
	export const extras: any;
}
