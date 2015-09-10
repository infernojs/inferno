import addAttributes from "./addAttributes";
import addProperties from "./addProperties";

let isBrowser = false;

if ( typeof window != "undefined" ) {

    isBrowser = true;

}

export default {

    addAttributes: addAttributes,
    addProperties: addProperties,
    createElement: ( tag ) => document.createElement( tag ),
    createText: ( text ) => document.createTextNode( text ),
    createEmpty: () => document.createTextNode( "" ),
    createFragment: () => document.createFragment()
};
