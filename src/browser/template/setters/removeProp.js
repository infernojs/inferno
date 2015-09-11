import PROP from "../hooks/propHook";

export default (node, name) => {

    let hook = PROP.remove[name];

    if (hook) {

        hook[name](node, name);

    } else {

        node[name] = "";
    }
};