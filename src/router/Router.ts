import Component from 'inferno-component';
import { isArray, isString, toArray } from '../shared';
import { isEmpty, matchPath, pathRankSort } from './utils';

export interface IRouterProps {
	url: string;
	history?: any;
	matched?: any;
	children?: any;
	component?: Component<any, any>;
}

function getURLString(location) {
	return isString(location) ? location : (location.pathname + location.search);
}

export function getRoutes(routing, locationOrContext: any) {
	let params = {};
	const location: string = getURLString(locationOrContext);

	function grabRoutes(_routes, url: string, lastPath: string) {
		if (!_routes) {
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

			if (children) {
				route.props.children = grabRoutes(children, url, fullPath);
			}

			const match = matchPath(isLast, fullPath, url.replace('//', '/'));
			if (match) {
				route.props.params = Object.assign(params, match.params);
				if (route.instance) {
					return route.type(route.instance.props, route.instance.context);
				} else {
					return route;
				}
			}
		}
	}

	return grabRoutes(routing, location, '');
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
		const { matched, children, url } = this.props;
		if (matched) {
			return matched;
		}

		const routes = toArray(children);
		return getRoutes(routes, url || this.state.url);
	}
}
