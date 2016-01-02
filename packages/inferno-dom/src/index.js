import { render } from '../../../src/DOM/rendering';
import createRef from '../../../src/core/createRef';
import createDOMTree from '../../../src/DOM/createTree';
import { addTreeConstructor } from '../../../src/core/createTemplate';

const global = global || ( typeof window !== 'undefined' ? window : null );

if ( global && global.Inferno ) {
	global.Inferno.addTreeConstructor( 'dom', createDOMTree );
} else  if (global && !global.Inferno) {

	const Inferno = require( 'inferno' );

	if(typeof Inferno.addTreeConstructor !== 'function') {
		throw('OLD PACKAGE DETECTED!! Upgrade to newest Inferno version before you can use the InfernoDOM package.')
	} else {
		Inferno.addTreeConstructor('dom', createDOMTree);
	}
} else {
	addTreeConstructor( 'dom', createDOMTree );
}


export default {
	render,
	createRef
};
