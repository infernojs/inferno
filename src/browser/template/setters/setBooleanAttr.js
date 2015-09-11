export default ( node, name, attrValue ) => {

    // don't set falsy values!
    if ( attrValue !== false ) {

        // booleans should always be lower cased
        node.setAttribute( name, "" + ( attrValue == true ? "" : attrValue ).toLowerCase() );

    }

};
