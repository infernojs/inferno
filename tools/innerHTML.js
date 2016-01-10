let comparer = document.createElement( 'div' );

export default function ( HTML ) {
	comparer.innerHTML = HTML;
	return comparer.innerHTML;
}