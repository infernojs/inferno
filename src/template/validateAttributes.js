import nsCfg from "./cfg/nsCfg";

// Simplified subset
let VALID_ATTRIBUTE_NAME_REGEX = /^[a-zA-Z_][a-zA-Z_\.\-\d]*$/,
    illegalAttributeNameCache = {},
    validatedAttributeNameCache = {};

export default ( attributeName ) => {

    if ( validatedAttributeNameCache[attributeName] ) {

        return true;

    }
    if ( illegalAttributeNameCache[attributeName] ) {

        return false;

    }

    if ( VALID_ATTRIBUTE_NAME_REGEX.test( attributeName ) || ( nsCfg[attributeName] ) ) {

        validatedAttributeNameCache[attributeName] = true;
        return true;

    }

    illegalAttributeNameCache[attributeName] = true;

    return false;

};
