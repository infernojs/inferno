import createElement from 'inferno-create-element';
import Route, { IRouteProps } from './Route';

export default class IndexRoute extends Route<IRouteProps, any> {
	render({ component, children, params, path = '/' }) {
		return createElement(component, {
			path,
			params,
			children
		});
	}
}
