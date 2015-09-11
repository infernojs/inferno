import HOOK from "../hooks/propHook";

export default ( node, name, value ) => {

    if ( HOOK[name] ) {

        HOOK( node, name, value );

    } else {

        if ( node[name] !== value ) {

            node[name] = value;
        }
    }
};
