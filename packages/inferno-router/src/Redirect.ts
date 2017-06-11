/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import Route from './Route';

export default class Redirect extends Route {
	constructor(props?: any, context?: any) {
		super(props, context);
		if (!props.to) {
			props.to = '/';
		}
	}
}
