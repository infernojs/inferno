function isInArray(arr, item) {
    const len = arr.length;
    let i = 0;

    while(i < len) {
        if(arr[i++] == item) {
            return true;
        }
    }

    return false;
}

function setSelectValue(node, value) {
	/*
  const isMultiple = Array.isArray(value),
        options = node.options,
        len = options.length;

    let i = 0,
        optionNode;

    while(i < len) {
        optionNode = options[i++];
        optionNode.selected = value != null &&
            (isMultiple? isArray(value, optionNode.value) : optionNode.value == value);
    }*/
}

export default setSelectValue;
