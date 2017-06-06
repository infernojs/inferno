/**
 * @module Inferno-Mobx
 */ /** TypeDoc Comment */

import connect from './connect';
import EventEmitter from './EventEmitter';
import inject from './inject';
import makeReactive, { componentByNodeRegistery, renderReporter, trackComponents } from './makeReactive';
import Provider from './Provider';

export default {
	EventEmitter,
	Provider,
	componentByNodeRegistery,
	connect,
	inject,
	makeReactive,
	observer: connect,
	renderReporter,
	trackComponents,
};

export {
	EventEmitter,
	Provider,
	componentByNodeRegistery,
	connect as observer,
	connect,
	inject,
	makeReactive,
	renderReporter,
	trackComponents,
};
