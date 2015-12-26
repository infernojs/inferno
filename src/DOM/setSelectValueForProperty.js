import isArray from '../util/isArray';
import isVoid from '../util/isVoid';
import inArray from '../util/inArray';

// TODO!! Optimize!!
export default function setSelectValueForProperty( vNode, domNode, value, useProperties ) {
	const isMultiple = isArray( value );
	const options = domNode.options;
	const len = options.length;

	let i = 0, optionNode;
value = typeof value === 'number' ? '' + value : value;
	while ( i < len ) {
		optionNode = options[i++];
		if ( useProperties ) {
			optionNode.selected = !isVoid( value ) &&
				( isMultiple ? inArray( value, optionNode.value ) : optionNode.value === value );
		} else {
			if ( !isVoid( value ) && ( isMultiple ? inArray( value, optionNode.value ) : optionNode.value === value ) ) {
				optionNode.setAttribute( 'selected', 'selected' );
			} else {
				optionNode.removeAttribute( 'selected' );
			}
		}
	}
}
