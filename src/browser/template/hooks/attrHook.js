
let hooks = { add: {}, remove: {}};

hooks.add.type = (node, name, value) => {

    const val = node.value; // value will be lost in IE if type is changed

    node.setAttribute(name, "" + value);
    node.value = val;
};

export default hooks;