import { render } from '../../../src/DOM/rendering';
import createRef from '../../../src/core/createRef';
import createDOMTree from '../../../src/DOM/createTree';

const global = global || ( typeof window !== 'undefined' ? window : null );

if ( global && global.Inferno ) {
	global.Inferno.addTreeConstructor( 'dom', createDOMTree );
} else { // is this working?
	let Inferno = require( 'inferno' );
	Inferno.addTreeConstructor( 'dom', createDOMTree );
}

export default {
	render,
	createRef
};
