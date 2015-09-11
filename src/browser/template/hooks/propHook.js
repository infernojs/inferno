import setSelectValue    from "../setters/setSelectValue";
import removeSelectValue from "../setters/removeSelectValue";
import isArray           from "../../../util/isArray";
import inArray           from "../../../util/inArray";

let hooks = { add: {}, remove: {}};

hooks.add.value = (node, name, value) => {

    switch (node.tagName) {

        case SELECT:
            // selectbox has special case
            setSelectValue(node, value);
            break;
        default:
            if (node[name] !== value) {
                node[name] = value;
            }
    }
};

hooks.remove.value = (node, name) => {

    switch (node.tagName) {

        case SELECT:
            // selectbox has special case
            removeSelectValue( node );
            break;
        default:
            node[name] = null;
    }
}
	
hooks.add.title = (node, value) => {
    let doc = node.ownerDocument;

    (node === doc.documentElement ? doc : node).title = value;
};

// Radio and checkbox setter
["radio", "checkbox"].forEach((tag) => {
hooks.add[tag] = (node, name, value) => {
    if (isArray(value)) {
        return (node.checked = inArray(node.value, value) >= 0);
    }
}
});

export default hooks;