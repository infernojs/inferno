declare module 'lodash/isPlainObject' {
	function isPlainObject(value: any): boolean;
	export = isPlainObject;
}

declare module 'invariant' {
	function invariant(condition: any, message: string): void;
	export = invariant;
}

declare module 'inferno-component' {
	interface ComponentLifecycle<P, S> {
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
	interface IRouterProps {
		history?: any;
		hashbang?: boolean;
		url: string;
		component?: Component<any, any>;
	}
	interface IRouteProps {
		async?: (params?: any) => Promise;
		params?: any;
		component?: Component<any, any>;
	}
	export class Router extends Component<IRouterProps, any> {}
	export class Router extends Component<IRouteProps, any> {}
}
