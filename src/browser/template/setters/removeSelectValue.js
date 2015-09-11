export default ( node ) => {

    const options = node.options,
        len = options.length;
    // skip iteration if no length
    if ( len ) {

        let i = 0;

        while ( i < len ) {

            options[i++].selected = false;

        }

    }

};
