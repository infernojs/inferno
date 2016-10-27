import Component from '../component/es2015';
import { isArray } from '../shared';
import { matchPath, pathRankSort } from './utils';

export interface IRouterProps {
	url: string;
	history?: any;
	matched?: any;
	component?: Component<any, any>;
}

export function getRoutes(_routes, url, lastPath = '') {

	if (!_routes) {
		return _routes;
	}

	const routes = toArray(_routes);
	routes.sort(pathRankSort);

	for (let i = 0; i < routes.length; i++) {
		const route = isArray(routes[i]) ? getRoutes(routes[i], url, lastPath) : routes[i];
		const path = route.props.path || '/';
		const newURL = url.replace('//', '/');
		const fullPath = (lastPath + path).replace('//', '/');
		const match = matchPath(false, fullPath, newURL);

		if (match) {
			route.props.params = match.params;
			const children = route.props.children;
			if (children) {
				route.props.children = getRoutes(children, url, fullPath);
			}
			if (route.instance) {
				return route.type(route.instance.props, route.instance.context);
			} else {
				return route;
			}
		}
	}
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
		return getRoutes(routes, url || this.state.url, '');
	}
}

function toArray(children) {
	return isArray(children) ? children : (children ? [children] : children);
}
