import Provider from './Provider';
import { trackComponents, renderReporter, componentByNodeRegistery } from './makeReactive';
import connect from './connect';
import inject from './inject';

export default {
	Provider,
	inject,
	connect,
	observer: connect,
	trackComponents,
	renderReporter,
	componentByNodeRegistery
};
