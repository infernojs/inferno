import isArray from "../util/isArray";


function populateOptions(node, props, values) {

    var value = props.value;

    if (!values[value]) {
        return;
    }
	
    if (node.tagName !== "OPTION") {
        for (let i = 0, len = node.children.length; i < len; i++) {
            populateOptions(node.children[i], value, values);
        }
        return;
    }
	
    props = props || {};
    props.selected = "selected";
}

function setSelectValue(node, props) {

    let value = props.value;

    if (value == null) {
        return;
    }

    let values = {};

    if (!isArray(value)) {
        values[value] = value;
    } else {
        for (let i = 0, len = value.length; i < len; i++) {
            values[value[i]] = value[i];
        }
    }
    populateOptions(node, value, values);
    
        delete props.value;
}

export default setSelectValue;