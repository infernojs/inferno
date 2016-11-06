import createElement from 'inferno-create-element';
import Route from './Route';

export default class IndexRoute extends Route {
	render({ component, children, params, path = '/' }) {
		return createElement(component, {
			path,
			params,
			children
		});
	}
}
