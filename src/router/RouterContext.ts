import Component from 'inferno-component';
import match from './match';

export interface IRouterProps {
	url: string;
	history?: any;
	matched?: any;
	children?: any;
	component?: Component<any, any>;
}

export default class RouterContext extends Component<IRouterProps, any> {
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
		const node = match(children, url);
		return node;
	}
}
