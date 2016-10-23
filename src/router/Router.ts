import Component from '../component/es2015';
import { isArray } from '../shared';
import { flatten, matchPath, pathRankSort } from './utils';
import { createVComponent } from '../core/shapes';

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
			history: this.props.history
		};
	}

	componentWillMount() {
		const { history } = this.props;

		this.unlisten = history.listen(url => {
			this.routeTo(url.pathname);
		});
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

		for (let i = 0; i < routes.length; i++) {
			const route = routes[i].props;
			const path = route.path;
			const newURL = url.replace('//', '/');
			const fullPath = (lastPath + path).replace('//', '/');
			const match = matchPath(false, fullPath, newURL);

			if (match) {
				const props = {
					params: match.params,
					children: this.getRoutes(route.children, url, fullPath)
				};
				if (route.async) {
					props.async = route.async;
				}
				const component = createVComponent(route.component, props, null, null, null);
				return component;
			}
		}
	}

	handleRoutes(_routes, url, lastPath?) {

		const routes = flatten(_routes);
		routes.sort(pathRankSort);

		return this.getRoutes(routes, url, lastPath);
	}

	routeTo(url) {
		this._didRoute = false;
		this.setState({ url }, null);
		return this._didRoute;
	}

	render() {
		const children = toArray(this.props.children);
		const url = this.props.url || this.state.url;

		return this.handleRoutes(children, url, '');
	}
}

function toArray(children) {
	return isArray(children) ? children : (children ? [children] : children);
}
