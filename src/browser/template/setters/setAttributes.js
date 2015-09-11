import HOOK from "../hooks/attrHook";

export default ( node, name, value ) => {

    if ( HOOK[name] ) {

        HOOK( node, name, value );

    } else {

       node.setAttribute( name, "" + value );	
	}
};
