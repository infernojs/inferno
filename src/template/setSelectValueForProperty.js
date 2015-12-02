import isArray from '../util/isArray';
import inArray from '../util/inArray';

// TODO!! Optimize!!
export default function setSelectValueForProperty(node, value) {


 const isMultiple = isArray(value);
 const options = node.options;
 const        len = options.length;


    let i = 0,
        optionNode;

    while(i < len) {
        optionNode = options[i++];
        optionNode.selected = value != null &&
            (isMultiple? inArray(value, optionNode.value) : optionNode.value == value);
    }
	
}