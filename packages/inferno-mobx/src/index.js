import Provider from '../../../src/mobx/Provider';
import {trackComponents, renderReporter, componentByNodeRegistery} from '../../../src/mobx/reactiveMixin';
import connect from '../../../src/mobx/connect';

export default {
	Provider,
	connect,
	observer: connect,
	trackComponents,
	renderReporter,
	componentByNodeRegistery
};
