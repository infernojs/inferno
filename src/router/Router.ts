import { cloneVNode } from 'inferno';
import Component from 'inferno-component';
import { isString, toArray } from '../shared';
import { VComponent } from '../core/shapes';
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

function matchRoutes(_routes, pathToMatch = '/', lastPath = '/') {

	if (!Object.keys(_routes).length) {
		return _routes;
	}
	const params = {};
	const routes = toArray(_routes);
	routes.sort(pathRankSort);

	for (let i = 0; i < routes.length; i++) {
		const route = routes[i];
		const fullPath = (lastPath + (route.props.path || '/')).replace('//', '/');
		const isLast = isEmpty(route.props.children);
		const match = matchPath(isLast, fullPath, pathToMatch);

		if (match) {
			let children = null;
			if (route.props.children) {
				const matched = matchRoutes(route.props.children, pathToMatch, fullPath);
				if (matched) {
					children = matched;
					Object.assign(params, matched.props.params);
				}
			}
			const node: VComponent = cloneVNode(route, {
				children,
				params: Object.assign(params, match.params),
				component:  route.props.component
			});

			return node;
		}
	}
}

export function getRoutes(_routes, currentURL: any) {
	const routes = toArray(_routes);
	const location: string = getURLString(currentURL);
	const matched = matchRoutes(routes, location, '/');
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
		const node = getRoutes(toArray(children), url);
		return node;
	}
}
