declare enum VNodeFlags {
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

type DOMNode = Node | SVGAElement;
type Key = string | number | null;
type Ref = Function | null;
type Type = string | Function | null;
type InfernoChildren = string | number | VNode | Array<string | VNode> | null;
type InfernoInput = VNode | VNode[] | null | string | string[] | number | number[];

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

interface LinkedEventData {
	data: any;
	event: Function;
}

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
	export function linkEvent(data: any, event: Function): LinkedEventData;

	// core shapes
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

	// cloning
	export function cloneVNode(
		vNodeToClone: VNode,
		props?: Props,
		..._children: InfernoChildren[]
	): VNode;

	// Shared items
	export const NO_OP;
	export const EMPTY_OBJ;

	// DOM
	export function render(input: InfernoInput, parentDom?: Node | SVGAElement): InfernoChildren;
	export function findDOMNode(ref: DOMNode): DOMNode;
	export function createRenderer(_parentDom: DOMNode): Function;
	export const options: Options;
}

export interface ComponentLifecycle<P, S> {
	componentDidMount?: () => void;
	componentWillMount?(): void;
	componentWillReceiveProps?(nextProps: P, nextContext: any): void;
	shouldComponentUpdate?(nextProps: P, nextState: S, nextContext: any): boolean;
	componentWillUpdate?(nextProps: P, nextState: S, nextContext: any): void;
	componentDidUpdate?(prevProps: P, prevState: S, prevContext: any): void;
	componentWillUnmount?: () => void;
}

export interface Mixin<P, S> extends ComponentLifecycle<P, S> {
	statics?: {
		[key: string]: any;
	};

	displayName?: string;
	propTypes?: {[index: string]: Function};

	getDefaultProps?(): P;
	getInitialState?(): S;
}

export interface ComponentSpec<P, S> extends Mixin<P, S> {
	mixins?: any;
	[propertyName: string]: any;
	render(props?, context?): any;
}

declare class Component<P, S> implements ComponentLifecycle<P, S>  {
	refs?: any;
	state?: S;
	props?: P;
	context?: any;
	_vNode;
	_unmounted?: boolean;
	constructor (props?: P, context?);
	componentWillReact();
	componentWillReceiveProps? (nextProps: P, nextContext: Object): void;
	componentWillUnmount();
	forceUpdate (): void;
	setState (v: Object, cb?: () => {}): boolean;
	isPrototypeOf (v: Object): void;
}

declare module 'inferno-component' {
	export = Component;
}

declare module 'inferno-create-class' {
	export default function createClass<P, S>(obj: ComponentSpec<P, S>): Component<P, S>;
}

declare module 'inferno-hyperscript' {
	export default function hyperscript(
		_tag: string | VNode, 
		_props?: any, 
		_children?: InfernoChildren
	): VNode;
}

declare module 'inferno-server' {
	export function renderToString();
	export function renderToStaticMarkup();
	export function streamAsString();
	export function streamAsStaticMarkup();
	export function RenderStream();
}