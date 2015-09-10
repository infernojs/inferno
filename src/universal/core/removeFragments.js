import removeFragment from "./removeFragment";

export default ( context, parentDom, fragments, i, to ) => {

    for ( ; i < to; i++ ) {

        removeFragment( context, parentDom, fragments[i] );

    }

};
