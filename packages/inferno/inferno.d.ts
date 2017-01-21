declare const enum VNodeFlags {
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

type InfernoInput = VNode | null | string | number;
type Key = string | number | null;
type Ref = Function | null;
type InfernoChildren = string | number | VNode | Array<string | number | VNode> | null;
type Type = string | Function | null;

interface Props {
	children?: InfernoChildren;
	ref?: Ref;
	key?: Key;
	events?: Object | null;
}

interface VNode {
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

declare module 'inferno' {
	interface Options {
		recyclingEnabled: boolean;
		findDOMNodeEnabled: boolean;
		roots: any;
		createVNode: Function | null;
		beforeRender: Function | null;
		afterRender: Function | null;
		afterMount: Function | null;
		afterUpdate: Function | null;
		beforeUnmount: Function | null;
	}

	export function createVNode(flags: number, type?: Type, props?: any, children?: InfernoChildren, events?: Object | null, key?: Key, ref?: Ref, noNormalise?: boolean): any;
	export function cloneVNode(node: VNode, props?: any, ...children: any[]): VNode;
	export function render(input: InfernoInput, parentDom?: Node | SVGAElement): InfernoChildren;
	export function findDOMNode(node: any): any;
	export function createRenderer(_parentDom?: any): Function;
	export function linkEvent(data: any, event: Function): Object;
	export const NO_OP: string;
	export const ERROR_MSG: string;
	export const EMPTY_OBJ: Object;
	export const options: Options;
	export const version: string;

	export default {
		createVNode,
		cloneVNode,
		render,
		findDOMNode,
		createRenderer,
		linkEvent,
		NO_OP,
		ERROR_MSG,
		EMPTY_OBJ,
		options,
		version
	};
}

declare module 'inferno-component' {
	interface ComponentLifecycle<P, S> {
		componentDidMount?: () => void;
		componentWillMount?(): void;
		componentWillReceiveProps?(nextProps: P, nextContext: any): void;
		shouldComponentUpdate?(nextProps: P, nextState: S, nextContext: any): boolean;
		componentWillUpdate?(nextProps: P, nextState: S, nextContext: any): void;
		componentDidUpdate?(prevProps: P, prevState: S, prevContext: any): void;
		componentWillUnmount?(): void;
	}

	export default class Component<P, S> implements ComponentLifecycle<P, S>  {
		refs?: any;
		state?: S;
		props?: P;
		context?: any;
		_vNode: VNode;
		_unmounted?: boolean;
		constructor (props?: P, context?: Object);
		componentWillReact(): void;
		componentWillReceiveProps? (nextProps: P, nextContext: Object): void;
		componentWillUnmount(): void;
		forceUpdate (): void;
		setState (v: Object, cb?: () => {}): boolean;
		setStateSync (v: Object): boolean;
		isPrototypeOf (v: Object): void;
	}
}

declare module 'inferno-server' {
	export function renderToString(input: any): string;
	export function renderToStaticMarkup(input: any): string;

	export default {
		renderToString,
		renderToStaticMarkup
	};
}

declare module 'inferno-create-class' {
	export default function createClass(obj: any): any;
}

declare module 'inferno-create-element' {
	export default function createElement(name: any, props?: any, ...children): VNode;
}

declare module 'inferno-hyperscript' {
	export default function hyperscript(_tag: string | VNode | Function, _props?: any, _children?: InfernoChildren): VNode;
}

declare module 'inferno-test-utils' {
	export function renderIntoDocument(element: VNode): VNode;
	export function isElement(element: VNode): boolean;
	export function isElementOfType(inst: VNode, componentClass: Function): boolean;
	export function isDOMComponent(inst: any): boolean;
	export function isDOMComponentElement(inst: VNode): boolean;
	export function isCompositeComponent(inst): boolean;
	export function isCompositeComponentWithType(inst, type: Function): boolean;
	export function findAllInRenderedTree(inst: any, test: Function): VNode[];
	export function scryRenderedDOMComponentsWithClass(root: VNode, classNames: string | string[]): VNode[];
	export function scryRenderedDOMComponentsWithTag (root: VNode, tagName: string): VNode[];
	export function scryRenderedComponentsWithType(root: VNode, componentType: Function): VNode[];
	export function findRenderedDOMComponentWithClass(root: VNode, classNames: string | string[]): VNode;
	export function findRenderedDOMComponentWithTag(root: VNode, tagName: string): VNode;
	export function findRenderedComponentWithType(root: VNode, componentClass: Function): VNode;
	export function mockComponent(componentClass, mockTagName?: string);

	export default {
		renderIntoDocument,
		isElement,
		isElementOfType,
		isDOMComponent,
		isDOMComponentElement,
		isCompositeComponent,
		isCompositeComponentWithType,
		findAllInRenderedTree,
		scryRenderedDOMComponentsWithClass,
		scryRenderedDOMComponentsWithTag,
		scryRenderedComponentsWithType,
		findRenderedDOMComponentWithClass,
		findRenderedDOMComponentWithTag,
		findRenderedComponentWithType,
		mockComponent
	};
}
