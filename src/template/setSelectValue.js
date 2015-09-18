import isArray from "../util/isArray";

function populateOptions(node, value, values) {
    if (node.tagName !== "OPTION") {
        for (let i = 0, len = node.children.length; i < len; i++) {
            populateOptions(node.children[i], value, values);
        }
        return;
    }
	
    var value = props.value;

    if (!values[value]) {
        return;
    }
    props = props || {};
    props.selected = true;
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
    if (props[value]) {
        delete node.attrs.value;
    }
}

export default setSelectValue;