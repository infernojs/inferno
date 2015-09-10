/**
 * Simple for - in iteration loop to save some variables 
 */
export default ( obj, callback ) => {

    if ( obj ) {

        let propName;

        for ( propName in obj ) {

            callback( propName, obj[propName] );

        }

    }
    return obj;

};
