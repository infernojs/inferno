function deleteValueForProperty(node, name) {
    let propertyInfo = properties[name] ?
        properties[name] : null;
    if (propertyInfo) {
        let hooks = propertyInfo.hooks;
        if (hooks) {
            hooks(node, undefined);
        } else if (propertyInfo.mustUseAttribute) {
            node.removeAttribute(propertyInfo.attributeName);
        } else {
            let propName = propertyInfo.propertyName;
            let defaultValue = getDefaultValueForProperty(
                node.nodeName,
                propName
            );

            if (!propertyInfo.hasSideEffects ||
                ("" + node[propName]) !== defaultValue) {
                node[propName] = defaultValue;
            }
        }
    } else {
        node.removeAttribute(name);
    }
}

export default deleteValueForProperty;