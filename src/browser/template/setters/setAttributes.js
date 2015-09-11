import HOOK from "../hooks/attrHook";

export default ( node, name, value ) => {

    if ( HOOK.set[name] ) {

        HOOK.set( node, name, value );

    } else {

       node.setAttribute( name, "" + value );	
	}
};
