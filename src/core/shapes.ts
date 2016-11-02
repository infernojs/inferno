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

    ComponentClass = 1 << 2,
    ComponentFunction = 1 << 3,

		HasKeyedChildren = 1 << 4,
		HasNonKeyedChildren = 1 << 5,

		SvgElement = 1 << 6,
    MediaElement = 1 << 7,
    InputElement = 1 << 8,
    TextAreaElement = 1 << 9,
		Fragment = 1 << 10,
    Void = 1 << 11,
		Element = HtmlElement | SvgElement | MediaElement | InputElement | TextAreaElement,
		Component = ComponentFunction | ComponentClass
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
        children: children || null,
        dom: null,
        flags,
        key: key === undefined ? null : key,
        props: props || null,
        ref: ref || null,
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
