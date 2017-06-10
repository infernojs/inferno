import connect from './connect';
import EventEmitter from './EventEmitter';
import inject from './inject';
import { componentByNodeRegistery, renderReporter, trackComponents } from './makeReactive';
import Provider from './Provider';

export default {
	EventEmitter,
	Provider,
	componentByNodeRegistery,
	connect,
	inject,
	observer: connect,
	renderReporter,
	trackComponents
};

export {
	EventEmitter,
	Provider,
	componentByNodeRegistery,
	connect as observer,
	connect,
	inject,
	renderReporter,
	trackComponents
};
