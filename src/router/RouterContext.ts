import Component from 'inferno-component';
import { IRouterProps } from './Router';
import match from './match';
import { process } from '../shared';

export default class RouterContext extends Component<IRouterProps, any> {
	constructor(props?: any, context?: any) {
		super(props, context);
		if (process.env.NODE_ENV !== 'production') {
			if (!props.matched && !props.location) {
				throw new TypeError('"inferno-router" requires a "location" prop passed');
			}
			if (!props.matched && !props.routes) {
				throw new TypeError('"inferno-router" requires a "matched" prop passed or "Route" children defined');
			}
		}
	}

	getChildContext() {
		return {
			router: this.props.router || {
				location: {
					pathname: this.props.location
				}
			}
		};
	}

	render({ routes, matched, location }) {
		if (matched) {
			return matched;
		}
		const route = match(routes, location);
		return route.matched;
	}
}
