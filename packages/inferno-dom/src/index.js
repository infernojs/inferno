import { render } from '../../../src/DOM/rendering';
import createRef from '../../../src/DOM/createRef';
import createDOMTree from '../../../src/DOM/createTree';

const GLOBAL = typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : null);

// browser
if (GLOBAL && GLOBAL.Inferno) {
	GLOBAL.Inferno.addTreeConstructor('dom', createDOMTree);
// nodeJS
// TODO! Find a better way to detect if we are running in Node, and test if this actually works!!!
} else if ( GLOBAL && !GLOBAL.Inferno ) {
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
			throw ('Your package is out-of-date! Upgrade to latest Inferno in order to use the InfernoDOM package.');
		} else {
			Inferno.addTreeConstructor('dom', createDOMTree);
		}
	}
}

export default {
	render,
	createRef
};
