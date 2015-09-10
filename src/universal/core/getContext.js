import contexts from "../vars/contexts";

export default ( dom ) => {

    for ( var i = 0; i < contexts.length; i++ ) {

        if ( contexts[i].dom === dom ) {

            return contexts[i];

        }

    }
    return null;

};
