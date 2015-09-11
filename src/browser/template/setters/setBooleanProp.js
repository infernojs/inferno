export default ( node, propertyName, propertyValue ) => {
// TODO! Optimize for v8
    node[propertyName] = !!propertyValue;
};
