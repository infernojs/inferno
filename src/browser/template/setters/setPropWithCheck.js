import PROP from "../hooks/propHook";

export default (node, name, value) => {

    const hook = PROP.set[name];

    if (hook) {

        hook(node, name, value);

    } else {

        if (node[name] !== value) {

            node[name] = value;
        }
    }
};