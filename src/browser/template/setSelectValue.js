import inArray from "../../util/inArray";
import isArray from "../../util/isArray";

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
