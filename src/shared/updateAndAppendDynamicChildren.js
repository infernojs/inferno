import isStringOrNumber from '../util/isStringOrNumber';

export default function updateAndAppendDynamicChildren(domNode, nextValue ) {

	for ( let i = 0; i < nextValue.length; i++ ) {
		if ( isStringOrNumber( nextValue[i] ) ) {
			domNode.appendChild( document.createTextNode( nextValue[i] ) );
		} else {
			// Do nothing for now
		}
	}
}