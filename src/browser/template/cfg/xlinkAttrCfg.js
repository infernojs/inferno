import xlinkCfg from "./xlinkCfg";

export default {
    set ( node, key, value ) {

        node.setAttributeNS( "http://www.w3.org/1999/xlink", xlinkCfg[key], "" + value );

    },
    remove ( node, key ) {

        node.removeAttributeNS( "http://www.w3.org/1999/xlink", xlinkCfg[key] );

    }
};
