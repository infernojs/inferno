import {
	isArray,
	isInvalid,
	isNullOrUndef,
	isStatefulComponent,
	isStringOrNumber,
	isUndefined,
	isString,
	isNull
} from '../shared';

import cloneVNode from '../factories/cloneVNode';

export interface Styles {
	[key: string]: number | string;
}

export interface IProps {
	[index: string]: any;
}
export interface VType {
	flags: VNodeFlags;
}

export type InfernoInput = VNode | VNode[] | null | string | string[] | number | number[];

export const enum VNodeFlags {
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

export type Key = string | number | null;
export type Ref = Function | null;
export type InfernoChildren = string | number | VNode | Array<string | VNode> | null;
export type Type = string | Function | null;

export interface Props {
	children?: InfernoChildren;
	ref?: Ref;
	key?: Key;
	events?: Object | null;
}

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

function _normalizeVNodes(nodes: any[], result: VNode[], i: number): void {
	for (; i < nodes.length; i++) {
		let n = nodes[i];

		if (!isInvalid(n)) {
			if (Array.isArray(n)) {
				_normalizeVNodes(n, result, 0);
			} else {
				if (isStringOrNumber(n)) {
					n = createTextVNode(n);
				} else if (isVNode(n) && n.dom) {
					n = cloneVNode(n);
				}
				result.push((applyKeyIfMissing(i, n as VNode)));
			}
		}
	}
}

function applyKeyIfMissing(index: number, vNode: VNode): VNode {
	if (isNull(vNode.key)) {
		vNode.key = `.${ index }`;
	}
	return vNode;
}

export function normalizeVNodes(nodes: any[]): VNode[] {
	let newNodes;

	// we assign $ which basically means we've flagged this array for future note
	// if it comes back again, we need to clone it, as people are using it
	// in an immutable way
	// tslint:disable
	if (nodes['$']) {
		nodes = nodes.slice();
	} else {
		nodes['$'] = true;
	}
	// tslint:enable
	for (let i = 0; i < nodes.length; i++) {
		const n = nodes[i];

		if (isInvalid(n) || Array.isArray(n)) {
			const result = (newNodes || nodes).slice(0, i) as VNode[];

			_normalizeVNodes(nodes, result, i);
			return result;
		} else if (isStringOrNumber(n)) {
			if (!newNodes) {
				newNodes = nodes.slice(0, i) as VNode[];
			}
			newNodes.push(applyKeyIfMissing(i, createTextVNode(n)));
		} else if ((isVNode(n) && n.dom) || (isNull(n.key) && !(n.flags & VNodeFlags.HasNonKeyedChildren))) {
			if (!newNodes) {
				newNodes = nodes.slice(0, i) as VNode[];
			}
			newNodes.push(applyKeyIfMissing(i, cloneVNode(n)));
		} else if (newNodes) {
			newNodes.push(applyKeyIfMissing(i, cloneVNode(n)));
		}
	}
	return newNodes || nodes as VNode[];
}

function normalizeChildren(children: InfernoChildren | null) {
	if (isArray(children)) {
		return normalizeVNodes(children);
	} else if (isVNode(children as VNode) && (children as VNode).dom) {
		return cloneVNode(children as VNode);
	}
	return children;
}

function normalizeProps(vNode: VNode, props: Props, children: InfernoChildren) {
	if (!(vNode.flags & VNodeFlags.Component) && isNullOrUndef(children) && !isNullOrUndef(props.children)) {
		vNode.children = props.children;
	}
	if (props.ref) {
		vNode.ref = props.ref;
	}
	if (props.events) {
		vNode.events = props.events;
	}
	if (!isNullOrUndef(props.key)) {
		vNode.key = props.key;
	}
}

export function copyPropsTo(copyFrom: Props, copyTo: Props) {
	for (let prop in copyFrom) {
		if (isUndefined(copyTo[prop])) {
			copyTo[prop] = copyFrom[prop];
		}
	}
}

function normalizeElement(type: string, vNode: VNode) {
	if (type === 'svg') {
		vNode.flags = VNodeFlags.SvgElement;
	} else if (type === 'input') {
		vNode.flags = VNodeFlags.InputElement;
	} else if (type === 'select') {
		vNode.flags = VNodeFlags.SelectElement;
	} else if (type === 'textarea') {
		vNode.flags = VNodeFlags.TextareaElement;
	} else if (type === 'media') {
		vNode.flags = VNodeFlags.MediaElement;
	} else {
		vNode.flags = VNodeFlags.HtmlElement;
	}
}

function normalize(vNode: VNode) {
	const props = vNode.props;
	const type = vNode.type;
	let children = vNode.children;

	// convert a wrongly created type back to element
	if (isString(type) && (vNode.flags & VNodeFlags.Component)) {
		normalizeElement(type as string, vNode);
		if (props.children) {
			vNode.children = props.children;
			children = props.children;
		}
	}
	if (props) {
		normalizeProps(vNode, props, children);
	}
	if (!isInvalid(children)) {
		vNode.children = normalizeChildren(children);
	}
	if (props && !isInvalid(props.children)) {
		props.children = normalizeChildren(props.children);
	}
}

export function createVNode(
	flags: VNodeFlags,
	type?,
	props?: Props,
	children?: InfernoChildren,
	events?,
	key?: Key,
	ref?: Ref,
	noNormalise?: boolean
): VNode {
	if (flags & VNodeFlags.ComponentUnknown) {
		flags = isStatefulComponent(type) ? VNodeFlags.ComponentClass : VNodeFlags.ComponentFunction;
	}
	const vNode = {
		children: isUndefined(children) ? null : children,
		dom: null,
		events: events || null,
		flags: flags || 0,
		key: key === undefined ? null : key,
		props: props || null,
		ref: ref || null,
		type
	};
	if (!noNormalise) {
		normalize(vNode);
	}
	return vNode;
}

export function createVoidVNode(): VNode {
	return createVNode(VNodeFlags.Void);
}

export function createTextVNode(text: string | number): VNode {
	return createVNode(VNodeFlags.Text, null, null, text);
}

export function isVNode(o: VNode): boolean {
	return !!o.flags;
}
