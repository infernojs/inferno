import ATTR from "../hooks/attrHook";

export default (node, name, value) => {

    let hook = ATTR.add[name];

    if (hook) {

        hook(node, name, value);

    } else {

        node.setAttribute(name, "" + value);
    }
};