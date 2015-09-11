export default (node, propName, value) => {
    // Legacy browsers would fuck this up if we don't force
    // the value to be a boolean
    node[propName] = !!value;
};