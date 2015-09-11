export default ( node, name, val ) => {

    if ( name === "type" && ( node.tagName === "INPUT" ) ) {

        const value = node.value; // value will be lost in IE if type is changed
        node.setAttribute( name, "" + val );
        node.value = value;

    } else {

        node.setAttribute( name, "" + val );

    }

};
