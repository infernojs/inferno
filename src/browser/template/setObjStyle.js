import cleanValues from "./cleanValues";
import forIn       from "../../utils/forIn";
import isArray     from "../../utils/isArray";

/**
 * Set CSS styles
 *
 * @param {Object} node
 * @param {String} propertyName
 * @param {String} value
 */
export default ( node, propertyName, value ) => {
	
    if ( typeof value === "string" ) {
		
        node.cssText = value;	
	
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
