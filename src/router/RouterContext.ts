import Component from 'inferno-component';

import { IRouterProps } from './Router';
import match from './match';

export default class RouterContext extends Component<IRouterProps, any> {
	constructor(props?: any, context?: any) {
		super(props, context);
		if (process.env.NODE_ENV !== 'production') {
			if (!props.location) {
				throw new ReferenceError('"inferno-router" requires a "location" prop passed');
			}
			if (!props.matched && !props.children) {
				throw new ReferenceError('"inferno-router" requires a "matched" prop or "Route" components passed');
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

	render() {
		// If we're injecting a single route (ex: result from getRoutes)
		// then we don't need to go through all routes again
		const { children, location, matched = null } = this.props;
		if (matched) {
			return matched;
		}
		const node = match(children, location);
		return node.matched;
	}
}
