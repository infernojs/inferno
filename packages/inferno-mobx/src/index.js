import Provider from '../../../build/mobx/Provider';
import {trackComponents, renderReporter, componentByNodeRegistery} from '../../../build/mobx/makeReactive';
import connect from '../../../build/mobx/connect';
import inject from '../../../build/mobx/inject';

export default {
	Provider,
	inject,
	connect,
	observer: connect,
	trackComponents,
	renderReporter,
	componentByNodeRegistery
};
