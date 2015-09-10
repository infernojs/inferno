import xmlCfg from "./xmlCfg";

export default {
    set: function( node, key, value ) {

        node.setAttributeNS( "http://www.w3.org/XML/1998/namespace", xmlCfg[key], "" + value );

    },
    remove: function( node, key ) {

        node.removeAttributeNS( "http://www.w3.org/XML/1998/namespace", xmlCfg[key] );

    }
};
