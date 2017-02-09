import Component from 'inferno-component';
import { IRouterProps } from './Router';

export default class RouterContext extends Component<IRouterProps, any> {
	constructor(props?: any, context?: any) {
		super(props, context);
		if (process.env.NODE_ENV !== 'production') {
			if (!props.location || !props.matched) {
				throw new TypeError('"inferno-router" requires a "location" and "matched" props passed');
			}
		}
	}

	getChildContext() {
		return {
			router: this.props.router || {
				location: {
					pathname: this.props.location,
					baseUrl: this.props.baseUrl
				}
			}
		};
	}

	render(props) {
		return props.matched;
	}
}
