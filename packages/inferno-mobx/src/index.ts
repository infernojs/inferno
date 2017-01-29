import Provider from './Provider';
import { trackComponents, renderReporter, componentByNodeRegistery } from './makeReactive';
import connect from './connect';
import inject from './inject';
import EventEmitter from './EventEmitter';

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
}
