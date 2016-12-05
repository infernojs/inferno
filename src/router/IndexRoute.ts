import Route from './Route';
import createElement from 'inferno-create-element';

export default class IndexRoute extends Route {
	render({ component, params }) {
		return createElement(component, {
			path: '/',
			params
		});
	}
}
