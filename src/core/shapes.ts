import {
	isArray,
	isInvalid,
	isNullOrUndef,
	isStatefulComponent,
	isStringOrNumber,
	isUndefined,
	isString
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

export interface VNode {
	children: string | Array<string | VNode> | VNode | null;
	dom: Node | null;
	events: Object | null;
	flags: VNodeFlags;
	key: string | number | null;
	props: Object | null;
	ref: Function | null;
	type: string | Function | null;
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
				result.push(n as VNode);
			}
		}
	}
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

		if (isInvalid(n)) {
			if (!newNodes) {
				newNodes = nodes.slice(0, i) as VNode[];
			}
			newNodes.push(n);
		} else if (Array.isArray(n)) {
			const result = (newNodes || nodes).slice(0, i) as VNode[];

			_normalizeVNodes(nodes, result, i);
			return result;
		} else if (isStringOrNumber(n)) {
			if (!newNodes) {
				newNodes = nodes.slice(0, i) as VNode[];
			}
			newNodes.push(createTextVNode(n));
		} else if (isVNode(n) && n.dom) {
			if (!newNodes) {
				newNodes = nodes.slice(0, i) as VNode[];
			}
			newNodes.push(cloneVNode(n));
		} else if (newNodes) {
			newNodes.push(cloneVNode(n));
		}
	}
	return newNodes || nodes as VNode[];
}

function normalizeChildren(children) {
	if (isArray(children)) {
		return normalizeVNodes(children);
	} else if (isVNode(children) && children.dom) {
		return cloneVNode(children);
	}
	return children;
}

function normalizeProps(vNode, props, children) {
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

function normalize(vNode) {
	const props = vNode.props;
	const children = vNode.children;

	// convert a wrongly created type back to element
	if (isString(vNode.type) && (vNode.flags & VNodeFlags.Component)) {
		vNode.flags = VNodeFlags.Element;
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

export function createVNode(flags, type?, props?, children?, events?, key?, ref?, noNormalise?: boolean): VNode {
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

export function createVoidVNode() {
	return createVNode(VNodeFlags.Void);
}

export function createTextVNode(text) {
	return createVNode(VNodeFlags.Text, null, null, text);
}

export function isVNode(o: VType): boolean {
	return !!o.flags;
}
