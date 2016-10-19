import { isUndefined } from '../shared';
import {
	NodeTypes,
	ChildrenTypes
} from './constants';
import createStaticVElementClone from '../factories/createStaticVElementClone';

export interface IProps {
	[index: string]: any;
}
export interface VType {
	type: number;
}

export type InfernoInput = InfernoElement | InfernoElement[] | null | string | number;
export type InfernoElement = VElement | VComponent;

export interface VPlaceholder extends VType {
	dom: null | Node | SVGAElement;
}

export interface VFragment extends VPlaceholder {
	pointer: any;
	children: string | null | number | Array<any>;
	childrenType: number;
}

export interface StaticVElement {
	children: string | null | number | Array<any>;
	tag: string;
	props: IProps;
	type: number;
}

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

export interface OptVElement extends VPlaceholder {
	bp: OptBlueprint;
	key: string | number | null;
	v0: any;
	v1: any;
	v2: any;
	v3: Array<any>;
}

export interface VComponent extends VPlaceholder {
	component: Function | null;
	hooks: any;
	instance: null | Object;
	key: null | string | number;
	props: IProps;
	ref: Function | null;
}

export interface VElement extends VPlaceholder {
	children: string | null | number | Array<any>;
	childrenType: number;
	key: null | string | number;
	props: IProps;
	ref: Function | null;
	tag: string;
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

export function createOptBlueprint(staticVElement: StaticVElement, v0, d0, v1, d1, v2, d2, v3, d3): OptBlueprint {
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
	createStaticVElementClone(bp, false);
	return bp;
}

export function createVComponent(component: any, props: IProps, key?, hooks?, ref?): VComponent {
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

export function createVElement(tag, props: IProps, children, key, ref, childrenType): VElement {
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

export function createStaticVElement(tag, props: IProps, children): StaticVElement {
	return {
		children,
		props,
		tag,
		type: NodeTypes.ELEMENT
	};
}

export function createVFragment(children, childrenType): VFragment {
	return {
		children,
		childrenType: childrenType || ChildrenTypes.UNKNOWN,
		dom: null,
		pointer: null,
		type: NodeTypes.FRAGMENT
	};
}

export function createVPlaceholder(): VPlaceholder {
	return {
		dom: null,
		type: NodeTypes.PLACEHOLDER
	};
}

export function isVElement(o: VType): boolean {
	return o.type === NodeTypes.ELEMENT;
}

export function isOptVElement(o: VType): boolean {
	return o.type === NodeTypes.OPT_ELEMENT;
}

export function isVComponent(o: VType): boolean {
	return o.type === NodeTypes.COMPONENT;
}

export function isVText(o: VType): boolean {
	return o.type === NodeTypes.TEXT;
}

export function isVFragment(o: VType): boolean {
	return o.type === NodeTypes.FRAGMENT;
}

export function isVPlaceholder(o: VType): boolean {
	return o.type === NodeTypes.PLACEHOLDER;
}

export function isVNode(o: VType): boolean {
	return !isUndefined(o.type);
}
