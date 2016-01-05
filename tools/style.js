let comparer = document.createElement( 'div' );

export default function ( CSS ) {
	if ( typeof CSS === 'undefined' || CSS === null ) {
		return CSS;
	}
	comparer.style.cssText = CSS;
	return comparer.style.cssText;
}