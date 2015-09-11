import setSelectValue from "../setters/setSelectValue";
import isArray from "../../../util/isArray";
import inArray from "../../../util/inArray";

/**
 * INTERNAL!!
 */
let hooks = {

        value(node, name, value) {

            switch (node.tagName) {

                case SELECT:
                    setSelectValue(node, value);
                    break;
                default:

                    if (node[name] !== value) {

                        node[name] = value;
                    }
            }
        }
};

// Radios and checkboxes setter
["radio", "checkbox"].forEach((attr) => {
    hooks[attr] = (node, name, value) => {
        if (isArray(value)) {
            return (elem.checked = inArray(node.value, value) >= 0);
        }
    }
});

export default hooks;