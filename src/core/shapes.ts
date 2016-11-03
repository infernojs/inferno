import { isUndefined } from '../shared';
import {
	OPT_ELEMENT,
	OPT_BLUEPRINT,
	COMPONENT,
	TEXT,
	ELEMENT,
	FRAGMENT,
	PLACEHOLDER
} from './NodeTypes';
import {
	UNKNOWN
} from './ChildrenTypes';
import createStaticVElementClone from '../factories/createStaticVElementClone';

export interface IProps {
	[index: string]: any;
}
export interface VType {
	nodeType: number;
}

export type InfernoInput = InfernoElement | InfernoElement[] | null | string| string[] | number | number[];
export type InfernoElement = VElement | VComponent;

export interface VNode extends VType {
	dom: null | Node | SVGAElement;
}

export interface VFragment extends VNode {
	pointer: any;
	children: string | null | number | Array<any>;
	childrenType: number;
}

export interface StaticVElement {
	children: string | null | number | Array<any>;
	tag: string;
	props: IProps;
	nodeType: number;
}

export interface OptBlueprint {
	clone: null | Node;
	svgClone: null | SVGAElement;
	d0: any;
	d1: any;
	d2: any;
	d3: Array<any>;
	nodeType: number;
	pools: {
		nonKeyed: Array<OptBlueprint>;
		keyed: Map<string | number, OptVElement>;
	};
	staticVElement;
	v0: any;
	v1: any;
	v2: any;
	v3: Array<any>;
}

export interface OptVElement extends VNode {
	bp: OptBlueprint;
	key: string | number | null;
	v0: any;
	v1: any;
	v2: any;
	v3: Array<any>;
}

export interface VComponent extends VNode {
	children?: string | null | number | Array<any>;
	type: Function | null;
	hooks: any;
	instance: null | Object;
	key: null | string | number;
	props: IProps;
	ref: Function | null;
}

export interface VElement extends VNode {
	children: string | null | number | Array<any>;
	childrenType: number;
	hooks?: any;
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
		nodeType: OPT_ELEMENT,
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
		nodeType: OPT_BLUEPRINT,
		pools: {
			nonKeyed: [],
			keyed: new Map<string | number, OptVElement>()
		},
		staticVElement,
		v0,
		v1,
		v2,
		v3
	};
	createStaticVElementClone(bp, false);
	return bp;
}

export function createVComponent(type: any, props: IProps, key?, hooks?, ref?): VComponent {
	return {
		type,
		dom: null,
		hooks: hooks || null,
		instance: null,
		key,
		nodeType: COMPONENT,
		props,
		ref: ref || null
	};
}

export function createVText(text) {
	return {
		dom: null,
		text,
		nodeType: TEXT
	};
}

export function createVElement(tag, props: IProps, children, key, ref, childrenType): VElement {
	return {
		children,
		childrenType: childrenType || UNKNOWN,
		dom: null,
		key,
		nodeType: ELEMENT,
		props,
		ref: ref || null,
		tag
	};
}

export function createStaticVElement(tag, props: IProps, children): StaticVElement {
	return {
		children,
		nodeType: ELEMENT,
		props,
		tag
	};
}

export function createVFragment(children, childrenType): VFragment {
	return {
		children,
		childrenType: childrenType || UNKNOWN,
		dom: null,
		nodeType: FRAGMENT,
		pointer: null
	};
}

export function createVPlaceholder(): VNode {
	return {
		dom: null,
		nodeType: PLACEHOLDER
	};
}

export function isVNode(o: VType): boolean {
	return !isUndefined(o.nodeType);
}
