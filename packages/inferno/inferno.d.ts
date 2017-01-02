declare module 'inferno' {
	export function createVNode(flags, type?, props?, children?, events?, key?, ref?, noNormalise?: boolean): any;
	export function cloneVNode(node, props?, ...children);
	export function render(...rest);
	export function findDOMNode(node: any): any;
	export function createRenderer(...rest);
	export function disableRecycling(...rest);
	export function linkEvent(data, event: Function);
	export function enableFindDOMNode();
	export const NO_OP;
	export const ERROR_MSG;
	export const EMPTY_OBJ;
}

declare module 'inferno-component' {
	class Component<P, C> {
		refs?: any;
		state?: any;
		props?: P;
		context?: C;
		_unmounted?: boolean;
		constructor (props?: P, context?: C);
		componentWillReact();
		componentWillReceiveProps? (nextProps: P, nextContext: C): void;
		forceUpdate (): void;
		setState (v: Object, cb?: () => {}): boolean;
		setStateSync (v: Object): boolean;
		isPrototypeOf (v: Object): void;
	}
	export default Component;
}

declare module 'inferno-server' {
	export function renderToStaticMarkup(...rest);
	export default function renderToString(...rest);
}

declare module 'inferno-create-class' {
	export default function createClass(component: any): any;
}

declare module 'inferno-create-element' {
	export default function createElement(component: any, props: any, ...children): any;
}

declare module 'inferno-hyperscript' {
	export default function hyperscript(tag: any, props?: any, ...children): any;
}
