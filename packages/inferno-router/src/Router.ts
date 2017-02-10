import { createVNode, VNode } from 'inferno';
import Component from 'inferno-component';
import match, { matchPath } from './match';
import RouterContext from './RouterContext';
import VNodeFlags from 'inferno-vnode-flags';

export interface IRouterProps {
	history?: any;
	children?: any;
	router: any;
	location: any;
	baseUrl?: any;
	component?: Component<any, any>;
}

function createrRouter(history) {
	if (!history) {
		throw new TypeError('Inferno: Error "inferno-router" requires a history prop passed');
	}
	return {
		push: history.push,
		replace: history.replace,
		listen: history.listen,
		createHref: history.createHref,
		isActive(url) {
			return matchPath(true, url, this.url);
		},
		get location() {
			return history.location.pathname !== 'blank' ? history.location : {
				pathname: '/',
				search: ''
			};
		},
		get url() {
			return this.location.pathname + this.location.search;
		}
	};
}

export default class Router extends Component<IRouterProps, any> {
	router: any;
	unlisten: any;

	constructor(props?: any, context?: any) {
		super(props, context);
		this.router = createrRouter(props.history);
		this.state = {
			url: props.url || this.router.url
		};
	}

	componentWillMount() {
		if (this.router) {
			this.unlisten = this.router.listen(() => {
				this.routeTo(this.router.url);
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			url: nextProps.url
		});
	}

	componentWillUnmount() {
		if (this.unlisten) {
			this.unlisten();
		}
	}

	routeTo(url) {
			this.setState({ url });
	}

	render(props): VNode {
		const hit = match(props.children, this.state.url);

		if (hit.redirect) {
			setTimeout(() => {
				this.router.replace(hit.redirect);
			}, 0);
			return null;
		}

		return createVNode(VNodeFlags.ComponentClass, RouterContext, {
			location: this.state.url,
			router: this.router,
			matched: hit.matched
		});
	}
}
