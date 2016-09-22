declare module 'lodash/isPlainObject' {
	function isPlainObject(value: any): boolean;
	export = isPlainObject;
}

declare module 'invariant' {
	function invariant(condition: any, message: string): void;
	export = invariant;
}

declare module 'inferno-component' {
	export interface ComponentLifecycle<P, S> {
		componentWillMount?(): void;
		componentDidMount?(): void;
		componentWillReceiveProps?(nextProps: P, nextContext: any): void;
		shouldComponentUpdate?(nextProps: P, nextState: S, nextContext: any): boolean;
		componentWillUpdate?(nextProps: P, nextState: S, nextContext: any): void;
		componentDidUpdate?(prevProps: P, prevState: S, prevContext: any): void;
		componentWillUnmount?(): void;
	}

	export default class Component<P, S> implements ComponentLifecycle<P, S> {
	}
}

declare module 'inferno-router' {
	import Component from 'inferno-component';
	export interface IRouterProps {
		history?: any;
		hashbang?: boolean;
		url: string;
		component?: Component<any, any>;
	}
	export interface IRouteProps {
		async?: (params?: any) => Promise;
		params?: any;
		component?: Component<any, any>;
	}
	export class Router extends Component<IRouterProps, any> {}
	export class Router extends Component<IRouteProps, any> {}
}

declare module 'inferno' {

	export enum ValueTypes {
		CHILDREN = 1,
		PROP_CLASS_NAME = 2,
		PROP_STYLE = 3,
		PROP_DATA = 4,
		PROP_REF = 5,
		PROP_SPREAD = 6,
		PROP_VALUE = 7,
		PROP = 8
	}

	export enum ChildrenTypes {
		NON_KEYED = 1,
		KEYED = 2,
		NODE = 3,
		TEXT = 4,
		UNKNOWN = 5
	}

	export enum NodeTypes {
		ELEMENT = 1,
		OPT_ELEMENT = 2,
		TEXT = 3,
		FRAGMENT = 4,
		OPT_BLUEPRINT = 5,
		COMPONENT = 6,
		PLACEHOLDER = 7
	}

	export interface IProps {
		[index: string]: any;
	}
	export interface VType {
		type: NodeTypes;
	}

	export interface VPlaceholder extends VType {
		dom: null | Node | SVGAElement;
	}

	export interface VFragment extends VPlaceholder {
		pointer: any;
		children: string | null | number | Array<any>;
		childrenType: ChildrenTypes;
	}

	export interface StaticVElement {
		children: string | null | number | Array<any>;
		tag: string;
		props: IProps;
		type: NodeTypes;
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
		type: NodeTypes;
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
		childrenType: ChildrenTypes;
		key: null | string | number;
		props: IProps;
		ref: Function | null;
		tag: string;
	}
}
