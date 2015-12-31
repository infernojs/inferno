let comparer = document.createElement( 'div' );

export default function ( HTML, container ) {
	comparer.innerHTML = HTML;
	expect( container.innerHTML ).to.equal( comparer.innerHTML );
}