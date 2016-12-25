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
	export default class Component<P, S> implements ComponentLifecycle<P, S>  {
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
		isPrototypeOf (v: Object): void;
	}
}
