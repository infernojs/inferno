import Component from '../component/es2015';
import {
	isArray,
	isNull
} from '../shared';
import {
	exec,
	convertToHashbang,
	pathRankSort
} from './utils';
import { createVComponent } from '../core/shapes';
import cloneVNode from '../factories/cloneVNode';

export interface IRouterProps {
	history?: any;
	hashbang?: boolean;
	url: string;
	component?: Component<any, any>;
}

export default class Router extends Component<IRouterProps, any> {
	_didRoute: boolean;

	constructor(props?: any, context?: any) {
		super(props, context);
		if (!props.history) {
			throw new Error('Inferno Error: "inferno-router" Router components require a "history" prop passed.');
		}
		this._didRoute = false;
		this.state = {
			url: props.url || props.history.getCurrentUrl()
		};
	}

	getChildContext() {
		return {
			history: this.props.history,
			hashbang: this.props.hashbang
		};
	}

	componentWillMount() {
		this.props.history.addRouter(this);
	}

	componentWillUnmount() {
		this.props.history.removeRouter(this);
	}

	handleRoutes(routes, url, hashbang, wrapperComponent, lastPath) {
		routes.sort(pathRankSort);

		for (let i = 0; i < routes.length; i++) {
			const route = routes[i];
			const { path } = route.props;
			const fullPath = lastPath + path;
			const params = exec(hashbang ? convertToHashbang(url) : url, fullPath);
			const children = toArray(route.props.children);

			if (children) {
				const subRoute = this.handleRoutes(children, url, hashbang, wrapperComponent, fullPath);

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
		const wrapperComponent = this.props.component;
		const hashbang = this.props.hashbang;

		return this.handleRoutes(children, url, hashbang, wrapperComponent, '');
	}
}

function toArray(children) {
	return isArray(children) ? children : (children ? [children] : children);
}
