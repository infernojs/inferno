import Provider from '../../../src/mobx/Provider';
import {trackComponents, renderReporter, componentByNodeRegistery} from '../../../src/mobx/observer';
import connect from '../../../src/mobx/connect';
import inject from '../../../src/mobx/inject';

export default {
	Provider,
	inject,
	connect,
	observer: connect,
	trackComponents,
	renderReporter,
	componentByNodeRegistery
};
