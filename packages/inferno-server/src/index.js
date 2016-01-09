import renderToString from '../../../src/server/renderToString';
import createHTMLTree from '../../../src/DOM/createTree';

const global = global || (typeof window !== 'undefined' ? window : null);

// browser
if (global && global.Inferno) {
	global.Inferno.addTreeConstructor('html', createHTMLTree);
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
			throw ('Your package is out-of-date! Upgrade to latest Inferno in order to use the InfernoServer package.');
		} else {
			Inferno.addTreeConstructor('html', createHTMLTree);
		}
	}
}

export default {
	renderToString
};
