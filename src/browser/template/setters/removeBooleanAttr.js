export default (node, propName) => {
    // Set corresponding property to false
    node[propName] = false;
    // Remove the attribute
    node.removeAttribute(propName);
};