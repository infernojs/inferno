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

declare module 'inferno' {
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

	export type InfernoChildren = string | number | VNode | Array<string | VNode> | null;
	export type InfernoInput = VNode | VNode[] | null | string | string[] | number | number[];

	export interface Props {
		children?: InfernoChildren;
		ref?: Ref;
		key?: Key;
		events?: Object | null;
	}

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
