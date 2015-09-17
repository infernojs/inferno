import rootListeners from './shared/rootListeners';

export default function addRootListener() {
	// FIX ME! Take this out into it's own module and do some event cleanup along the road?
	document.addEventListener( 'click', ( e ) => {
		for ( let i = 0; i < rootListeners.click.length; i++) {
			if ( rootListeners.click[i].target === e.target ) {
				rootListeners.click[i].callback( e );
			}
		}
	} );
}
