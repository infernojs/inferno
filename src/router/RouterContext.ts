import Component from 'inferno-component';

import { IRouterProps } from './Router';
import match from './match';

export default class RouterContext extends Component<IRouterProps, any> {
	constructor(props?: any, context?: any) {
		super(props, context);
		if (process.env.NODE_ENV !== 'production') {
			if (!props.matched && !props.location) {
				throw new TypeError('"inferno-router" requires a "location" prop passed');
			}
			if (!props.matched && !props.children) {
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

	render({ children, location, matched = null }) {
		// If we're injecting a single route (ex: result from getRoutes)
		// then we don't need to go through all routes again
		if (matched) {
			return matched;
		}

		const node = match(children, location);
		return node.matched;
	}
}
