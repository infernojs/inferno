/* eslint eqeqeq:0 */
export default function isValidAttribute( strings ){
	let i = 0;
	let character;

	while ( i <= strings.length ) {
		character = strings[ i ];
		if ( !isNaN( character * 1 ) ) {
			return false;
		} else {
			if ( character == character.toUpperCase() ) {
				return false;
			}
			if ( character === character.toLowerCase() ) {
				return true;
			}
		}
		i++;
	}

	return false;
}
