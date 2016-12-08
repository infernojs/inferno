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

function createrRouter(history) {
	if (!history) {
		throw new TypeError('Inferno: Error "inferno-router" requires a history prop passed');
	}
	return {
		push: history.push,
		listen: history.listen,
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
			this.unlisten = this.router.listen((url) => {
				this.routeTo(url.pathname);
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

	render() {
		return createElement(RouterContext, {
			location: this.state.url,
			router: this.router,
			routes: this.props.children
		});
	}
}
