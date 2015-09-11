import PROP from "../hooks/propHook";

export default (node, name) => {

    const hook = PROP.remove[name];

    if (hook) {

        hook[name](node, name);

    } else {
        // 'className' is a edge case, and has to be set as empty string
        node[name] = (name === "className") ? "" : null;
    }
};