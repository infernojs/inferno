declare enum VNodeFlags {
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

type Key = string | number | null;
type Ref = Function | null;
type InfernoChildren = string | number | VNode | Array<string | VNode> | null;
type Type = string | Function | null;

interface Props {
	children?: InfernoChildren;
	ref?: Ref;
	key?: Key;
	events?: Object | null;
}

interface VNode {
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

declare module 'inferno' {
	export function createVNode(flags, type?, props?, children?, events?, key?, ref?, noNormalise?: boolean): any;
	export function cloneVNode(node, props?, ...children);
	export function render(...rest);
	export function enableFindDOMNode();
	export function findDOMNode(node: any): any;
	export function createRenderer(...rest);
	export function linkEvent(data, event: Function);
	export const NO_OP;
	export const ERROR_MSG;
	export const EMPTY_OBJ;
	interface Options {
		recyclingEnabled: boolean;
		findDOMNodeEnabled: boolean;
		roots: any;
		createVNode: Function | null;
		beforeRender: Function | null;
		afterRender: Function | null;
		afterMount: Function | null;
		afterUpdate: Function | null;
		beforeUnmount: Function | null;
	}

	export const options: Options;
}

declare module 'inferno-component' {
	interface ComponentLifecycle<P, S> {
		componentDidMount?: () => void;
		componentWillMount?(): void;
		componentWillReceiveProps?(nextProps: P, nextContext: any): void;
		shouldComponentUpdate?(nextProps: P, nextState: S, nextContext: any): boolean;
		componentWillUpdate?(nextProps: P, nextState: S, nextContext: any): void;
		componentDidUpdate?(prevProps: P, prevState: S, prevContext: any): void;
		componentWillUnmount?(): void;
	}
	class Component<P, S> implements ComponentLifecycle<P, S>  {
		refs?: any;
		state?: S;
		props?: P;
		context?: any;
		_vNode;
		_unmounted?: boolean;
		constructor (props?: P, context?);
		componentWillReact();
		componentWillReceiveProps? (nextProps: P, nextContext: Object): void;
		componentWillUnmount();
		forceUpdate (): void;
		setState (v: Object, cb?: () => {}): boolean;
		setStateSync (v: Object): boolean;
		isPrototypeOf (v: Object): void;
	}
	export default Component;
}

declare module 'inferno-server' {
	export function renderToStaticMarkup(...rest);
	export default function renderToString(...rest);
}

declare module 'inferno-create-class' {
	export default function createClass(component: any): any;
}

declare module 'inferno-create-element' {
	export default function createElement(component: any, props: any, ...children): any;
}

declare module 'inferno-hyperscript' {
	export default function hyperscript(tag: any, props?: any, ...children): any;
}

declare module 'inferno-test-utils' {
	type stringArr = string | string[];
	
	export function renderIntoDocument(element: VNode): VNode;
	export function isElement(element: VNode): boolean;
	export function isElementOfType(inst: VNode, componentClass: Function): boolean;
	export function isDOMComponent(inst: any): boolean;
	export function isDOMComponentElement(inst: VNode): boolean;
	export function isCompositeComponent(inst): boolean;
	export function isCompositeComponentWithType(inst, type: Function): boolean;
	export function findAllInRenderedTree(inst: any, test: Function): VNode[];
	export function scryRenderedDOMComponentsWithClass(root: VNode, classNames: stringArr): VNode[];
	export function scryRenderedDOMComponentsWithTag (root: VNode, tagName: string): VNode[];
	export function scryRenderedComponentsWithType (root: VNode, componentType: Function): VNode[];
	export function findRenderedDOMComponentsWithClass(root: VNode, classNames: Function): VNode;
	export function findenderedDOMComponentsWithTag(root: VNode, tagName: Function): VNode;
	export function findRenderedComponentWithType(root: VNode, componentClass: Function): VNode;
	export function mockComponent(module, mockTagName: string);

	export default {
		renderIntoDocument,
		isElement,
		isElementOfType,
		isDOMComponent,
		isDOMComponentElement,
		isCompositeComponent,
		isCompositeComponentWithType,
		findAllInRenderedTree,
		scryRenderedDOMComponentsWithClass,
		scryRenderedDOMComponentsWithTag,
		scryRenderedComponentsWithType,
		findRenderedDOMComponentsWithClass,
		findenderedDOMComponentsWithTag,
		findRenderedComponentWithType,
		mockComponent
	};
}

declare module 'lodash/isPlainObject' {
	function isPlainObject(value: any): boolean;
	export = isPlainObject;
}

declare module 'invariant' {
	function invariant(condition: any, message: string): void;
	export = invariant;
}

declare module 'hoist-non-inferno-statics' {
	function hoistStatics(connectClass: any, wrappedComponent: any): {[index: string]: any};
	export = hoistStatics;
}

declare module 'path-to-regexp-es6' {
	function pathToRegExp(routePath: any, keys: any, end: any);
	export default pathToRegExp;
}

declare module 'concat-stream-es6' {
	function concatStream(func?: any);
	export default concatStream;
}

declare module 'history/createBrowserHistory' {
	function createBrowserHistory(options?: any);
	export = createBrowserHistory;
}

declare module 'history/createMemoryHistory' {
	function createMemoryHistory(options?: any);
	export = createMemoryHistory;
}

declare module 'mobx' {
	export function toJS(value: any): any;
	export function observable(value: any): any;
	export function isObservable(value: any, property?: string): boolean;
	export function extendObservable(...rest): any;
	export class Reaction {
		constructor(name?: string, onInvalidate?: any);
		track(param: any): void;
		runReaction();
		dispose();
		getDisposer(): any;
	}
	export const extras: any;
}

declare module 'redux' {
	export function createStore(callback: any): any;
	export function bindActionCreators(actionCreators: any, dispatch: any): any;
}

declare module 'sinon' {
	export function spy(obj: any, event: string): any;
	export function stub(obj: any, event: string, callback: any): any;
	export const assert;
}

declare module 'most' {
	export function map(f?: any, stream?: any): any;
	export function reduce(f?: any, intitial?: any, stream?: any): any;
	export function scan(f?: any, initial?: any, stream?: any): any;
}

declare module 'most-subject' {
	export function hold(bufferSize?: number, subject?: any): any;
	export function sync(): void;
}

declare module 'lodash/fp' {
	export function curry(obj: any): any;
}

declare module 'union-type-es' {
	export default function (obj: any): any;
}

interface Window { process: any; __karma__: any; mocha: any; }

//noinspection TsLint
declare namespace process {
	//noinspection TsLint
	export interface env {
		NODE_ENV: any;
	}
}
