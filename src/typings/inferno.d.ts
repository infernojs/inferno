declare module 'inferno' {
	enum VNodeFlags {
		Text = 1,
		HtmlElement = 1 << 1,

		ComponentClass = 1 << 2,
		ComponentFunction = 1 << 3,
		ComponentUnknown = 1 << 4,

		HasKeyedChildren = 1 << 5,
		HasNonKeyedChildren = 1 << 6,

		SvgElement = 1 << 7,
		MediaElement = 1 << 8,
		InputElement = 1 << 9,
		TextareaElement = 1 << 10,
		SelectElement = 1 << 11,
		Void = 1 << 12,
		Element = HtmlElement | SvgElement | MediaElement | InputElement | TextareaElement | SelectElement,
		Component = ComponentFunction | ComponentClass | ComponentUnknown
	} 

	type Key = string | number | null;
	type Ref = Function | null;
	type InfernoChildren = string | number | VNode | Array<string | VNode> | null;
	type Type = string | Function | null;

	interface Props {
		children?: InfernoChildren;
		ref?: Ref;
		key?: Key;
		events?: Object | null;
	}

	type InfernoInput = VNode | VNode[] | null | string | string[] | number | number[];

	export interface VNode {
		children: InfernoChildren;
		dom: Node | null;
		events: Object | null;
		flags: VNodeFlags;
		key: Key;
		props: Props | null;
		ref: Ref;
		type: Type;
		parentVNode?: VNode;
	}

	interface LinkedEvent {
		data: any;
		event: any;
	}
	
	/**
	 * Create a new VNode instance
	 * 
	 * @export
	 * @param {VNodeFlags} flags
	 * @param {Type} [type]
	 * @param {Props} [props]
	 * @param {InfernoChildren} [children]
	 * @param {any} [events]
	 * @param {Key} [key]
	 * @param {Ref} [ref]
	 * @param {boolean} [noNormalise]
	 * @returns {VNode} The new VNode instance
	 */
	export function createVNode(
		flags: VNodeFlags,
		type?: Type,
		props?: Props,
		children?: InfernoChildren,
		events?,
		key?: Key,
		ref?: Ref,
		noNormalise?: boolean
	): VNode;

	export function cloneVNode(
		vNodeToClone: VNode, 
		props?: Props, 
		..._children: InfernoChildren[]
	): VNode

	export function render(
		input: InfernoInput, 
		parentDom?: Node | SVGAElement
	): InfernoInput;

	export function findDOMNode(ref: any): any;

	export function createRenderer(parentElement: Node | SVGAElement);
	export function disableRecycling(): void;
	export function linkEvent(data, event): LinkedEvent;
	export function enableFindDOMNode(): void;
	export const NO_OP;
	export const EMPTY_OBJ;
}

declare module 'inferno-component' {
	export default class Component<P, C> {
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
		isPrototypeOf (v: Object): void;
	}
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
