let initialisedListeners = false;

export default ( value ) => {

    if ( value ) {

        initialisedListeners = value;

    } else {

        return initialisedListeners;

    }

};
