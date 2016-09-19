import { isUndefined } from '../shared';
import { NodeTypes, ChildrenTypes } from './constants';

export interface OptBlueprint {
	clone: null | Node;
	svgClone: null | SVGAElement;
	d0: any;
	d1: any;
	d2: any;
	d3: Array<any>;
	pools: {
		nonKeyed: Array<OptBlueprint>;
		keyed: Map<string | number, OptVElement>;
	};
	staticVElement;
	type: number;
	v0: any;
	v1: any;
	v2: any;
	v3: Array<any>;
}

export interface OptVElement {
	bp: OptBlueprint;
	dom: null | Node | SVGAElement;
	key: string | number | null;
	type: number;
	v0: any;
	v1: any;
	v2: any;
	v3: Array<any>;
}

export interface VComponent {
	component: Function | null;
	dom: null | Node | SVGAElement;
	hooks: any;
	instance: null | Object;
	key: null | string | number;
	props: any;
	ref: Function | null;
  type: number;
}

export interface VElement {
	children: string | null | number | Array<any>;
	childrenType: number;
	dom: null | Node | SVGAElement;
	key: null | string | number;
	props: any;
	ref: Function | null;
	tag: string;
  type: number;
}

export function createOptVElement(bp, key, v0, v1, v2, v3): OptVElement {
	return {
		bp,
		dom: null,
		key,
		type: NodeTypes.OPT_ELEMENT,
		v0,
		v1,
		v2,
		v3
	};
}

export function createOptBlueprint(staticVElement, v0, d0, v1, d1, v2, d2, v3, d3, renderer): OptBlueprint {
	const bp: OptBlueprint = {
		clone: null,
		svgClone: null,
		d0,
		d1,
		d2,
		d3,
		pools: {
			nonKeyed: [],
			keyed: new Map<string | number, OptVElement>()
		},
		staticVElement,
		type: NodeTypes.OPT_BLUEPRINT,
		v0,
		v1,
		v2,
		v3
	};
	if (renderer) {
		renderer.createStaticVElementClone(bp, false);
	}
	return bp;
}

export function createVComponent(component, props, key, hooks, ref): VComponent {
	return {
		component,
		dom: null,
		hooks: hooks || null,
		instance: null,
		key,
		props,
		ref: ref || null,
		type: NodeTypes.COMPONENT
	};
}

export function createVText(text) {
	return {
		dom: null,
		text,
		type: NodeTypes.TEXT
	};
}

export function createVElement(tag, props, children, key, ref, childrenType): VElement {
	return {
		children,
		childrenType: childrenType || ChildrenTypes.UNKNOWN,
		dom: null,
		key,
		props,
		ref: ref || null,
		tag,
		type: NodeTypes.ELEMENT
	};
}

export function createStaticVElement(tag, props, children) {
	return {
		children,
		props,
		tag,
		type: NodeTypes.ELEMENT
	};
}

export function createVFragment(children, childrenType) {
	return {
		children,
		childrenType: childrenType || ChildrenTypes.UNKNOWN,
		dom: null,
		pointer: null,
		type: NodeTypes.FRAGMENT
	};
}

export function createVPlaceholder() {
	return {
		dom: null,
		type: NodeTypes.PLACEHOLDER
	};
}

export function isVElement(o) {
	return o.type === NodeTypes.ELEMENT;
}

export function isOptVElement(o) {
	return o.type === NodeTypes.OPT_ELEMENT;
}

export function isVComponent(o) {
	return o.type === NodeTypes.COMPONENT;
}

export function isVText(o) {
	return o.type === NodeTypes.TEXT;
}

export function isVFragment(o) {
	return o.type === NodeTypes.FRAGMENT;
}

export function isVPlaceholder(o) {
	return o.type === NodeTypes.PLACEHOLDER;
}

export function isVNode(o) {
	return !isUndefined(o.type);
}
