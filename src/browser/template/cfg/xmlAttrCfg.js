import xmlCfg from "./xmlCfg";

export default {
    set ( node, key, value ) {

        node.setAttributeNS( "http://www.w3.org/XML/1998/namespace", xmlCfg[key], "" + value );

    },
    remove( node, key ) {

        node.removeAttributeNS( "http://www.w3.org/XML/1998/namespace", xmlCfg[key] );

    }
};
