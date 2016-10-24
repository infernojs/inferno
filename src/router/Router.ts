import Component from '../component/es2015';
import { isArray } from '../shared';
import { flatten, matchPath, pathRankSort } from './utils';

export interface IRouterProps {
	url: string;
	history?: any;
	component?: Component<any, any>;
}

export default class Router extends Component<IRouterProps, any> {
	_didRoute: boolean;
	unlisten: any;

	constructor(props?: any, context?: any) {
		super(props, context);
		this._didRoute = false;
		this.state = {
			url: props.url || (props.history.location.pathname + props.history.location.search)
		};
	}

	getChildContext() {
		return {
			history: this.props.history || {
				location: {
					pathname: this.props.url
				}
			}
		};
	}

	componentWillMount() {
		const { history } = this.props;

		if (history) {
			this.unlisten = history.listen(url => {
				this.routeTo(url.pathname);
			});
		}
	}

	componentWillUnmount() {
		if (this.unlisten) {
			this.unlisten();
		}
	}

	getRoutes(_routes, url, lastPath?) {

		if (!_routes) {
			return _routes;
		}

		const routes = toArray(_routes);
		routes.sort(pathRankSort);

		for (let i = 0; i < routes.length; i++) {
			const route = isArray(routes[i]) ? this.getRoutes(routes[i], url, lastPath) : routes[i];
			const path = route.props.path || '/';
			const children = route.props.children;
			const newURL = url.replace('//', '/');
			const fullPath = (lastPath + path).replace('//', '/');
			const match = matchPath(false, fullPath, newURL);

			if (match) {
				route.props.params = match.params;
				route.props.children = this.getRoutes(children, url, fullPath);
				return route;
			}
		}
	}

	routeTo(url) {
		this._didRoute = false;
		this.setState({ url }, null);
		return this._didRoute;
	}

	render() {
		const routes = toArray(this.props.children);
		const url = this.props.url || this.state.url;

		const newRoutes = this.getRoutes(routes, url, '');
		return newRoutes;
	}
}

function toArray(children) {
	return isArray(children) ? children : (children ? [children] : children);
}
