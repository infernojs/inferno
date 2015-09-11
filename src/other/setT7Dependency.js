/**
 * Both a setter & getter for t7 dependency
 */

let t7dependency = true;

export default ( set7dependency ) => {
    if ( set7dependency === true ) {
        t7dependency = true;
    } else {
        return t7dependency;
    }
};
