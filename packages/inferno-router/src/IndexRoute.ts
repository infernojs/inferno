/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import Route from './Route';

export default class IndexRoute extends Route {
	constructor(props?: any, context?: any) {
		super(props, context);
		props.path = '/';
	}
}
