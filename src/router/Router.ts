import { createVComponent } from 'inferno';
import Component from 'inferno-component';
import { isArray, isString, toArray } from '../shared';
import { VComponent } from '../core/shapes';
import { isEmpty, matchPath, pathRankSort } from './utils';

export interface IRouterProps {
	url: string;
	history?: any;
	matched?: any;
	children?: any;
	component?: Component<any, any>;
}

interface IMatchRoutes {
	params?: any;
	children?: any;
	component?: Component<any, any>;
}

function getURLString(location) {
	return isString(location) ? location : (location.pathname + location.search);
}

function matchRoutes(_routes, pathToMatch = '/', lastPath = '/') {
	const routes = toArray(_routes);
	routes.sort(pathRankSort);

	for (let i = 0; i < routes.length; i++) {
		const route = routes[i];
		const props: IMatchRoutes = {
			params: {},
			component: null
		};

		if (route.instance) {
			debugger;
		}

		const urlToMatch = (lastPath + (route.props.path || '/')).replace('//', '/');
		const isLast = isEmpty(route.props.children);
		const match = matchPath(isLast, urlToMatch, pathToMatch);

		if (match) {
			if (isArray(route.props.children)) {
				const matchedRoutes = matchRoutes(route.props.children, pathToMatch, urlToMatch);
				if (matchedRoutes && matchedRoutes.instance) {
					debugger;
				}
				props.children = matchedRoutes;
			}
			Object.assign(props, {
				params: match.params,
				component: route.props.component
			});
			const node: VComponent = createVComponent(route.type, props);
			/*if (route.instance) {
				return route.type(route.instance.props, route.instance.context);
			}*/
			return node;
		}
	}
}

export function getRoutes(routing, currentURL: any) {
	const params = {};
	const routes2 = toArray(routing);

	function grabRoutes(_routes, url: string, lastPath: string) {
		/*if (!_routes) {
			return _routes;
		}

		const routes = toArray(_routes);
		routes.sort(pathRankSort);

		for (let i = 0; i < routes.length; i++) {
			const route = routes[i];

			if (isArray(route)) {
				return grabRoutes(route, url, lastPath);
			}

			const { children, path = '/' } = route.props;
			const fullPath = (lastPath + path).replace('//', '/');
			const isLast = isEmpty(children);
			const match = matchPath(isLast, fullPath, url.replace('//', '/'));

			if (match) {
				Object.assign(params, match.params);
				route.props.params = params;
				if (children) {
					route.props.children = grabRoutes(children, url, fullPath);
				}
				if (route.instance) {
					route.instance.props.params = params;
					return route.type(route.instance.props, route.instance.context);
				} else {
					return route;
				}
			}
		}*/
	}

	const location: string = getURLString(currentURL);
	const matched = matchRoutes(routes2, location, '/');
	return matched;
}

export default class Router extends Component<IRouterProps, any> {
	_didRoute: boolean;
	router: any;
	unlisten: any;

	constructor(props?: any, context?: any) {
		super(props, context);
		this._didRoute = false;
		this.router = props.history;
		this.state = {
			url: props.url || (this.router.location.pathname + this.router.location.search)
		};
	}

	getChildContext() {
		return {
			router: this.router || {
				location: {
					pathname: this.props.url
				}
			}
		};
	}

	componentWillMount() {
		if (this.router) {
			this.unlisten = this.router.listen(url => {
				this.routeTo(url.pathname);
			});
		}
	}

	componentWillUnmount() {
		if (this.unlisten) {
			this.unlisten();
		}
	}

	routeTo(url) {
		this._didRoute = false;
		this.setState({ url });
		return this._didRoute;
	}

	render() {
		// If we're injecting a single route (ex: result from getRoutes)
		// then we don't need to go through all routes again
		const { matched, children, url = this.state.url } = this.props;
		if (matched) {
			return matched;
		}

		return getRoutes(toArray(children), url);
	}
}
