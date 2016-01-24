import shallowRender from '../../../src/testUtils/shallowRender';
import deepRender from '../../../src/testUtils/deepRender';
import createTestTree from '../../../src/testUtils/createTree';
import renderIntoDocument from '../../../src/testUtils/renderIntoDocument';
import Simulate from '../../../src/testUtils/Simulate';
import Inferno from 'inferno';

if (Inferno) {
	if (typeof Inferno.addTreeConstructor !== 'function') {
		throw ('Your package is out-of-date! Upgrade to latest Inferno in order to use the InfernoDOM package.');
	} else {
		Inferno.addTreeConstructor('test', createDOMTree);
	}
}

export default {
	shallowRender,
	deepRender,
	renderIntoDocument
	//Simulate
};

