import renderToString from '../../../src/server/renderToString';
import createHTMLTree from '../../../src/server/createTree';
import Inferno from 'inferno';

if (Inferno) {
	if (typeof Inferno.addTreeConstructor !== 'function') {
		throw ('Your package is out-of-date! Upgrade to latest Inferno in order to use the InfernoDOM package.');
	} else {
		Inferno.addTreeConstructor('html', createDOMTree);
	}
}

export default {
	renderToString
};

