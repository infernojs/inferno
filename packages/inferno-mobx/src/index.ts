import connect from './connect';
import EventEmitter from './EventEmitter';
import inject from './inject';
import { componentByNodeRegistery, renderReporter, trackComponents } from './makeReactive';
import Provider from './Provider';

export default {
	componentByNodeRegistery,
	connect,
	inject,
	observer: connect,
	Provider,
	renderReporter,
	trackComponents
};

export {
	EventEmitter,
	Provider,
	inject,
	connect,
	connect as observer,
	trackComponents,
	renderReporter,
	componentByNodeRegistery
};
