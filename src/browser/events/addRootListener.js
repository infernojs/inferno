import initialisedListeners from "./shared/initialisedListeners";

export default () => {

    // has to do this 'hack' else it will become read-only
    initialisedListeners( true );
   
    if ( rootlisteners != null ) {

        // FIX ME! Take this out into it's own module and do some event cleanup along the road?
        document.addEventListener( "click", ( e ) => {

            for ( let i = 0; i < rootlisteners.click.length; i = i + 1 | 0 ) {

                if ( rootlisteners.click[i].target === e.target ) {

                    rootlisteners.click[i].callback.call( rootlisteners.click[i].component || null, e );

                }

            }

        } );

    }

};
