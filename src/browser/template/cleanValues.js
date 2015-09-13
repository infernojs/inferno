import unitlessCfg  from "./cfg/unitlessCfg";

export default function( name, value ) {

    if ( value == null || ( value === "" ) ) {

        return "";
    }

    if ( value === 0 || ( unitlessCfg[name] || ( isNaN( value ) ) ) ) {

        return "" + value; // cast to string
    }

    if ( typeof value === "string" ) {

        value = value.trim();
    }

    return value + "px";
};