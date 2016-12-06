import Route from './Route';
import createElement from 'inferno-create-element';

export default class IndexRoute extends Route {
	render({ component, children, params }) {
		return createElement(component, {
			path: '/',
			params,
			children
		});
	}
}
