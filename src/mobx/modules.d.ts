declare module 'inferno-component' {
	export = class Component {
		constructor(props?, context?);
	};
}

declare module 'inferno-dom' {
	export function findDOMNode(node: any): void;
}

declare module 'inferno-create-class' {
	function createClass(component: any): any;
	export = createClass;
}

declare module 'inferno-create-element' {
	function createElement(component: any, props: any, children: any): any;
	export = createElement;
}
