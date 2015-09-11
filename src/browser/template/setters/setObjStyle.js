import cleanValues from "./cleanValues";
import forIn       from "../../../util/forIn";
import isArray     from "../../../util/isArray";

/**
 * Set CSS styles
 *
 * @param {Object} node
 * @param {String} propertyName
 * @param {String} value
 */
export default ( node, propertyName, value ) => {
	
	// FIX ME!! t7 has to be fixed so it handle object literal. Then 
	// we can remove this 'typeof' check
    if ( typeof value === "string" ) {
		
        node.style.cssText = value;	
	
    } else {
	
        let idx = 0, len, style = node[propertyName];

        forIn( value, ( styleName, styleValue ) => {
		
            if ( styleValue != null ) {
		 	
                if ( isArray( styleValue ) ) {
			
                    for ( len = styleValue.length; idx < len; idx++ ) {

                        style[styleName] = cleanValues( styleName, styleValue[idx] );
                    }

                } else {

                    style[styleName] = cleanValues( styleName, styleValue );
                }

            } else {

                style[styleName] = "";
            }

        } );
    }
};
