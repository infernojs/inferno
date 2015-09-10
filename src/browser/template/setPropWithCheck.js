import setSelectValue from "./setSelectValue";

export default ( node, name, value ) => {

    if ( name === "value" && ( node.tagName === "SELECT" ) ) {

        setSelectValue( node, value );

    } else {

        if ( node[name] !== value ) {

            node[name] = value;

        }

    }

};
