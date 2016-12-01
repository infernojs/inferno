import Component from 'inferno-component';
import RouterContext from './RouterContext';
import createElement from 'inferno-create-element';

export interface IRouterProps {
	history?: any;
	children?: any;
	router: any;
	location: any;
	component?: Component<any, any>;
}

export default class Router extends Component<IRouterProps, any> {
	router: any;
	unlisten: any;

	constructor(props?: any, context?: any) {
		super(props, context);
		if (!props.history) {
			throw new TypeError('Inferno: Error "inferno-router" requires a history prop passed');
		}
		this.router = props.history;
		const location = this.router.location.pathname + this.router.location.search;
		this.state = {
			url: props.url || (location !== 'blank' ? location : '/')
		};
	}

	componentWillMount() {
		if (this.router) {
			this.unlisten = this.router.listen((url) => {
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
			this.setState({ url });
	}

	render({ children, url }) {
		return createElement(RouterContext, {
			location: url || this.state.url,
			router: this.router
		}, children);
	}
}
