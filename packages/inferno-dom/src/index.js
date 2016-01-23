import { render } from '../../../src/DOM/rendering';
import createRef from '../../../src/DOM/createRef';
import createDOMTree from '../../../src/DOM/createTree';
import Inferno from 'inferno';

if (Inferno) {
	if (typeof Inferno.addTreeConstructor !== 'function') {
		throw ('Your package is out-of-date! Upgrade to latest Inferno in order to use the InfernoDOM package.');
	} else {
		Inferno.addTreeConstructor('dom', createDOMTree);
	}
}

export default {
	render,
	createRef
};
