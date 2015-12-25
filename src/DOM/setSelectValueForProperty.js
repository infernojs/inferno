import isArray from '../util/isArray';
import inArray from '../util/inArray';

// TODO!! Optimize!!
export default function setSelectValueForProperty( vNode, domNode, value, useProperties ) {
	const isMultiple = isArray( value );
	const options = domNode.options;
	const len = options.length;

	let i = 0, optionNode;
	while ( i < len ) {
		optionNode = options[i++];
		if ( useProperties ) {
			optionNode.selected = value != null &&
				( isMultiple ? inArray( value, optionNode.value ) : optionNode.value === value );
		} else {
			if ( value != null && ( isMultiple ? inArray(value, optionNode.value ) : optionNode.value === value) ) {
				optionNode.setAttribute( 'selected', 'selected' );
			} else {
				optionNode.removeAttribute( 'selected' );
			}
		}
	}
}