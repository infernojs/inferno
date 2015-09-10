/**
 * Both a setter & getter for t7 dependency
 */
let t7dependency = true;

export default ( hast7dependency ) => {

    if ( arguments.length ) {

        t7dependency = hast7dependency;
    // if no args, do a return 

    } else {

        return t7dependency;

    }

};
