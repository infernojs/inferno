import initialisedListeners from "./shared/initialisedListeners";
import rootListeners from "./shared/rootListeners";

export default () => {
    // has to do this 'hack' else it will become read-only
    initialisedListeners( true );

    // FIX ME! Take this out into it's own module and do some event cleanup along the road?
    document.addEventListener( "click", ( e ) => {
        for ( let i = 0; i < rootListeners.click.length; i++) {
            if ( rootListeners.click[i].target === e.target ) {
                rootListeners.click[i].callback( e );
            }
        }
    } );
};
