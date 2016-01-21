import shallowRender from '../../../src/testUtils/shallowRender';
import deepRender from '../../../src/testUtils/deepRender';
import createTestTree from '../../../src/testUtils/createTree';
import renderIntoDocument from '../../../src/testUtils/renderIntoDocument';
import Simulate from '../../../src/testUtils/Simulate';

const global = global || (typeof window !== 'undefined' ? window : null);

// browser
if (global && global.Inferno) {
	global.Inferno.addTreeConstructor('test', createTestTree);
// nodeJS
// TODO! Find a better way to detect if we are running in Node, and test if this actually works!!!
} else if (global && !global.Inferno) {
	let Inferno;

	// TODO! Avoid try / catch
	try {
		Inferno = require('inferno');
	} catch (e) {
		Inferno = null;
		// TODO Should we throw a warning and inform that the Inferno package is not installed?
	}

	if (Inferno != null) {
		if (typeof Inferno.addTreeConstructor !== 'function') {
			throw ('Your package is out-of-date! Upgrade to latest Inferno in order to use the InfernoTestUtils package.');
		} else {
			Inferno.addTreeConstructor('test', createTestTree);
		}
	}
}

export default {
	shallowRender,
	deepRender,
	renderIntoDocument,
	Simulate
};
