import inArray from "../../utils/inArray";
import isArray from "../../utils/isArray";

export default ( node, value ) => {

    const isMultiple = isArray( value ),
        options = node.options,
        len = options.length;

    let i = 0,
        optionNode;

    if ( value != null ) {

        while ( i < len ) {

            optionNode = options[i++];

            if ( isMultiple ) {

                optionNode.selected = inArray( value, optionNode.value );

            } else {

                optionNode.selected = optionNode.value == value;

            }

        }

    }

};
