/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

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

	public getChildContext() {
		return {
			router: this.props.router || {
				location: {
					baseUrl: this.props.baseUrl,
					pathname: this.props.location
				}
			}
		};
	}

	public render(props) {
		return props.matched;
	}
}
