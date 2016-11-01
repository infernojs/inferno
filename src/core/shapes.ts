export interface IProps {
	[index: string]: any;
}
export interface VType {
	flags: VNodeFlags;
}

export type InfernoInput = VNode | VNode[] | null | string | string[] | number | number[];

export enum VNodeFlags {
    Text = 1,
    HtmlElement = 1 << 1,
    SvgElement = 1 << 2,
    MediaElement = 1 << 3,
    InputElement = 1 << 4,
    TextAreaElement = 1 << 5,
    Fragment = 1 << 6,
    Void = 1 << 7,
    ComponentClass = 1 << 8,
    ComponentFunction = 1 << 9
}

export interface VNode {
    children: String | Array<String | VNode> | VNode | null;
    dom: Node | null;
    flags: VNodeFlags;
    key: String | null;
    props: Object | null;
    ref: Function | null;
    type: String | Function;
}

export function createVNode(type, props, children, flags, key, ref): VNode {
	return {
    children,
    dom: null,
    flags,
    key,
    props,
    ref,
    type
	};
}

export function createFragmentVNode(children) {
	return createVNode(null, null, children, VNodeFlags.Fragment, null, null);
}

export function createVoidVNode() {
	return createVNode(null, null, null, VNodeFlags.Void, null, null);
}

export function isVNode(o: VType): boolean {
	return !!o.flags;
}
