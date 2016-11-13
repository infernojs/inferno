import {
	isStringOrNumber,
	isArray,
	isInvalid,
	isUndefined,
	isNullOrUndef,
	isNull,
	isStatefulComponent
} from '../shared';
import cloneVNode from '../factories/cloneVNode';

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

	HasKeyedChildren = 1 << 4,
	HasNonKeyedChildren = 1 << 5,

	SvgElement = 1 << 6,
	MediaElement = 1 << 7,
	InputElement = 1 << 8,
	TextareaElement = 1 << 9,
	SelectElement = 1 << 10,
	Void = 1 << 11,
	Element = HtmlElement | SvgElement | MediaElement | InputElement | TextareaElement | SelectElement,
	Component = ComponentFunction | ComponentClass
}

export interface VNode {
	children: string | Array<string | VNode> | VNode | null;
	dom: Node | null;
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

function normalize(vNode) {
	const props = vNode.props;
	const children = vNode.children;

	if (props) {
		if (isNullOrUndef(children) && !isNullOrUndef(props.children)) {
			vNode.children = props.children;
		}
		if (props.ref) {
			vNode.ref = props.ref;
		}
		if (!isNullOrUndef(props.key)) {
			vNode.key = props.key;
		}
	}
	if (isArray(children)) {
		vNode.children = normalizeVNodes(children);
	}
}

export function createVNode(flags, type?, props?, children?, key?, ref?, noNormalise?: boolean): VNode {
	if (isNull(flags)) {
		flags = isStatefulComponent(type) ? VNodeFlags.ComponentClass : VNodeFlags.ComponentFunction;
	}
	const vNode = {
		children: isUndefined(children) ? null : children,
		dom: null,
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
