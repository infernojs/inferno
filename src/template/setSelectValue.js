import isArray from "../util/isArray";
import inArray from "../util/inArray";

function setSelectValue(node, props) {

var value = props.value;
     const isMultiple = isArray(value),
        options = node.options,
        len = options.length;

    let i = 0,
        optionNode;

    while(i < len) {
        optionNode = options[i++];
        optionNode.selected = value != null &&
            (isMultiple? inArray(value, optionNode.value) : optionNode.value == value);
    }
}

export default setSelectValue;