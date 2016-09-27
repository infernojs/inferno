declare module 'inferno-component' {
	export = class Component<any, any> {
		public props;
		public context;
		constructor(props?, context?);
		componentWillReceiveProps();
		forceUpdate();
	};
}

declare module 'inferno-dom' {
	export function findDOMNode(node: any): any;
}

declare module 'inferno-create-class' {
	function createClass(component: any): any;
	export = createClass;
}

declare module 'inferno-create-element' {
	function createElement(component: any, props: any, children: any): any;
	export = createElement;
}
