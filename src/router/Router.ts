import Component from 'inferno-component';
import createElement from 'inferno-create-element';
import RouterContext from './RouterContext';

export interface IRouterProps {
	url: string;
	history?: any;
	matched?: any;
	children?: any;
	component?: Component<any, any>;
}

export default class Router extends Component<IRouterProps, any> {
	_didRoute: boolean;
	router: any;
	unlisten: any;

	constructor(props?: any, context?: any) {
		super(props, context);
		if (!props.history && !props.matched) {
			throw new TypeError('Inferno: Error "inferno-router" requires a history prop passed, or a matched Route');
		}
		this._didRoute = false;
		this.router = props.history;
		this.state = {
			url: props.url || (this.router.location.pathname + this.router.location.search)
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
		const { children, url } = this.props;
		return createElement(RouterContext, {
			location: url || this.state.url,
			router: this.router
		}, children);
	}
}
