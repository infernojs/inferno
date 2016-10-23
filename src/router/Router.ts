import Component from '../component/es2015';
import { isArray } from '../shared';
import { pathRankSort, flatten } from './utils';
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

	getRoutes(_routes, url) {

		if (!_routes) {
			return _routes;
		}

		const routes = toArray(_routes);

		for (let i = 0; i < routes.length; i++) {
			const route = routes[i].props;
			const path = route.path[0] === '/' ? route.path.substring(1) : route.path;
			const newURL = url[0] === '/' ? url.substring(1) : url;

			if (newURL.indexOf(path) === 0) {
				const newPath = newURL.substr(path.length);
				const component = createVComponent(route.component, null, null, null, null);
				component.props = {
					children: this.getRoutes(route.children, newPath)
				};
				return component;
			}
		}
	}

	handleRoutes(_routes, url, wrappers?, lastPath?) {

		const routes = flatten(_routes);
		routes.sort(pathRankSort);

		const matchedComponent = this.getRoutes(routes, url);

		if (!lastPath && wrappers) {
			return matchedComponent;
		}

		/*if (!lastPath && wrappers) {
			this._didRoute = true;

			const finalComponent = wrappers.map(wrapper => {
				return createVComponent(wrapper, null, null, null, null);
			});

			// const wrapperComponent = wrappers.shift();

			const finalComponent = wrappers.reduce(function(previous, current, index, array) {
				const component = createVComponent(current, null, null, null, null);
				if (!previous.type) {
					previous = component;
					return previous;
				}

				if (!previous.props) {
					previous.props = {
						children: component
					};
				}
				return previous;
			}, {});

			debugger;
			return finalComponent;

			// return createVComponent(wrappers, null, null, null, null);
		}*/
		return null;
	}

	routeTo(url) {
		this._didRoute = false;
		this.setState({ url }, null);
		return this._didRoute;
	}

	render() {
		const children = toArray(this.props.children);
		const url = this.props.url || this.state.url;

		return this.handleRoutes(children, url, [], '');
	}
}

function toArray(children) {
	return isArray(children) ? children : (children ? [children] : children);
}
