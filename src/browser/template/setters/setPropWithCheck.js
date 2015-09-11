import HOOK from "../hooks/propHook";

export default ( node, name, value ) => {

    if ( HOOK.set[name] ) {

        HOOK.set( node, name, value );

    } else {

        if ( node[name] !== value ) {

            node[name] = value;
        }
    }
};
