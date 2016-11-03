import {
	isString,
	isNumber,
	isArray,
	isNull
} from '../shared';

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
	TextAreaElement = 1 << 9,
	Fragment = 1 << 10,
	Void = 1 << 11,
	Element = HtmlElement | SvgElement | MediaElement | InputElement | TextAreaElement,
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

function _normaliseVNodes(nodes: any[], result: VNode[], i: number): void {
	for (; i < nodes.length; i++) {
		let n = nodes[i];

		if (n !== null) {
			if (Array.isArray(n)) {
				_normaliseVNodes(n, result, 0);
			} else {
				if (isString(n)) {
					n = createTextVNode(n);
				} else if (isNumber(n)) {
					n = createTextVNode(n + '');
				}
				result.push(n as VNode);
			}
		}
	}
}

export function normaliseVNodes(nodes: any[]): VNode[] {
	for (let i = 0; i < nodes.length; i++) {
		const n = nodes[i];

		if (n === null || Array.isArray(n)) {
			const result = nodes.slice(0, i) as VNode[];

			_normaliseVNodes(nodes, result, i);
			return result;
		} else if (isString(n)) {
			nodes[i] = createTextVNode(n);
		} else if (isNumber(n)) {
			nodes[i] = createTextVNode(n + '');
		}
	}
	return nodes as VNode[];
}

export function createVNode(flags, type?, props?, children?, key?, ref?): VNode {
	return {
		children: (isArray(children) ? normaliseVNodes(children) : children) || null,
		dom: null,
		flags: flags || 0,
		key: key === undefined ? null : key,
		props: props || null,
		ref: ref || null,
		type
	};
}

export function createFragmentVNode(children) {
	return createVNode(VNodeFlags.Fragment, null, null, children);
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
