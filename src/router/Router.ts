import Component from '../component/es2015';
import { isArray, isNull, isObject } from '../shared';
import { exec, pathRankSort, flatten } from './utils';
import { createVComponent } from '../core/shapes';
import cloneVNode from '../factories/cloneVNode';
import history from './history';

const isDevelopment = process.env.NODE_ENV !== 'production';

export interface IRouterProps {
	url: string;
	component?: Component<any, any>;
}

export default class Router extends Component<IRouterProps, any> {
	_didRoute: boolean;
	unlisten: any;

	constructor(props?: any, context?: any) {
		super(props, context);
		this._didRoute = false;
		this.state = {
			url: props.url || (history.location.pathname + history.location.search)
		};
	}

	getChildContext() {
		return {
			history
		};
	}

	componentWillMount() {
		this.unlisten = history.listen(url => {
			this.routeTo(url.pathname);
		});
	}

	componentWillUnmount() {
		if (this.unlisten) {
			this.unlisten();
		}
	}

	handleRoutes(_routes, url, wrapperComponent?, lastPath?) {

		const routes = flatten(_routes);
		routes.sort(pathRankSort);

		for (let i = 0; i < routes.length; i++) {
			const route = routes[i];

			if (isDevelopment && !isObject(route)) {
				throw new Error(`Invalid prop "routes" (${typeof route}). Expected a component.`);
			}

			const { path } = route.props;
			const fullPath = lastPath + path;
			const params = exec(url, fullPath);
			const children = toArray(route.props.children);

			if (children) {
				if (route.props.component) {
					wrapperComponent = route.props.component;
				}
				const subRoute = this.handleRoutes(children, url, wrapperComponent, fullPath);

				if (!isNull(subRoute)) {
					return subRoute;
				}
			}
			if (params) {
				if (wrapperComponent) {
					return createVComponent(wrapperComponent, {
						params,
						children: cloneVNode(route, {
							params
						})
					}, null, null, null);
				}
				return cloneVNode(route, {
					params
				});
			}
		}
		if (!lastPath && wrapperComponent) {
			this._didRoute = true;
			return createVComponent(wrapperComponent, null, null, null, null);
		}
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

		return this.handleRoutes(children, url, null, '');
	}
}

function toArray(children) {
	return isArray(children) ? children : (children ? [children] : children);
}
