import connect from './connect';
import EventEmitter from './EventEmitter';
import inject from './inject';
import { componentByNodeRegistery, renderReporter, trackComponents } from './makeReactive';
import Provider from './Provider';

export default {
	Provider,
	inject,
	connect,
	observer: connect,
	trackComponents,
	renderReporter,
	componentByNodeRegistery
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
