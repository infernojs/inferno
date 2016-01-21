import createRenderer from '../../../src/testUtils/renderToString';
import createShallowTree from '../../../src/testUtils/createTree';

const global = global || (typeof window !== 'undefined' ? window : null);

// browser
if (global && global.Inferno) {
	global.Inferno.addTreeConstructor('shallow', createShallowTree);
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
			Inferno.addTreeConstructor('shallow', createShallowTree);
		}
	}
}

export default {
	createRenderer
};
