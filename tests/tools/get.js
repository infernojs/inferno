var rreturn = /\r/g,
 each = ( collection, callback ) => {

     var arr = collection || [],
         index = -1,
         length = arr.length;

     while ( ++index < length ) {

         callback( arr[index], index, arr );

     }
     return arr;

 };
 
 export default function( node ) {

        var type = node.getAttribute( "type" ) == null ? node.nodeName.toLowerCase() : node.getAttribute( "type" );

        if ( arguments.length === 1 ) {

            if ( type === "checkbox" || type === "radio" ) {

                if ( !node.checked ) {

                    return false;

                }

                var val = node.getAttribute( "value" );

                return val == null ? true : val;

            } else if ( type === "select" ) {

                if ( node.multiple ) {

                    var result = [];

                    each( node.options, function( option ) {

                        if ( option.selected &&
                            // Don't return options that are disabled or in a disabled optgroup
                            option.getAttribute( "disabled" ) === null &&
                            ( !option.parentNode.disabled || option.parentNode.nodeName !== "OPTGROUP" ) ) {

                            result.push( option.value || option.text );

                        }

                    } );

                    return result;

                }
                return ~node.selectedIndex ? node.options[node.selectedIndex].value : "";

            }

        }

        var ret = node.value;
        return typeof ret === "string" ?
            // Handle most common string cases
            ret.replace( rreturn, "" ) :
            // Handle cases where value is null/undef or number
            ret == null ? "" : ret;

    };