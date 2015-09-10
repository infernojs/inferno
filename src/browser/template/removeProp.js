import removeSelectValue from "./removeSelectValue";

let defaultPropVals = {};

function getDefaultPropVal( tag, attrName ) {

    let tagAttrs = defaultPropVals[tag] || ( defaultPropVals[tag] = {} );
    return attrName in tagAttrs ?
        tagAttrs[attrName] :
        tagAttrs[attrName] = document.createElement( tag )[attrName];

}

export default function( node, name ) {

    if ( name === "value" && node.tagName === "SELECT" ) {

        removeSelectValue( node );

    } else {

        node[name] = getDefaultPropVal( node.tagName, name );

    }

}
