// TODO namespace all these types
declare const enum VNodeFlags {  // TODO remove duplicate (see 'inferno-vnode-flags')
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

declare const process: {
	env: { NODE_ENV: string | undefined },
};

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

// TODO:
// export these, or make it so they are accessible to other packages

declare module 'inferno/lib/lifecycle' {
	export default class Lifecycle {
		listeners: Function[];
		fastUnmount: boolean;

		addListener(callback: Function);
		trigger();
	}
}

declare module 'inferno/lib/core/structures' {
	export interface Styles {
		[key: string]: number | string;
	}

	export interface IProps {
		[index: string]: any;
	}
	export interface VType {
		flags: VNodeFlags;
	}
}
