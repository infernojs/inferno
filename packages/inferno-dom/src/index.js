import { render } from '../../../src/DOM/rendering';
import createRef from '../../../src/core/createRef';
import createDOMTree from '../../../src/DOM/createTree';
import { addTreeConstructor } from '../../../src/core/createTemplate';

const global = global || ( typeof window !== 'undefined' ? window : null );



if ( global && global.Inferno ) {
	global.Inferno.addTreeConstructor( 'dom', createDOMTree );
} else {
	addTreeConstructor( 'dom', createDOMTree );
}

export default {
	render,
	createRef
};
