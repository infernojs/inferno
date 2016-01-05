import isVoid from '../util/isVoid';
import isArray from '../util/isArray';
import isStringOrNumber from '../util/isStringOrNumber';

export default function createDynamicChildren(domNode, nextValue ) {

	for ( let i = 0; i < nextValue.length; i++ ) {
		if ( isStringOrNumber( nextValue[i] ) ) {
			domNode.appendChild( document.createTextNode( nextValue[i] ) );
		} else {
			// Do nothing for now
		}
	}
}