const doc = global.document,
    elementProtos = {};

function createDOMNode(tagName, namespace, typextension) {

    let element, key;

    if (namespace) {
        if (typextension) {

            key = ns + is + ':' + tagName;
            baseElement = elementProtos[key] || (elementProtos[key] = doc.createElementNS(namespace, tagName, typextension));
        } else {

            key = ns + ':' + tagName;
            baseElement = elementProtos[key] || (elementProtos[key] = doc.createElementNS(namespace, tagName));
        }
    } else {
        if (typextension) {

            key = is + ':' + tagName;
            element = elementProtos[key] || (elementProtos[key] = doc.createElement(tagName, typextension));
        } else {
            element = elementProtos[tagName] || (elementProtos[tagName] = doc.createElement(tagName));
        }
    }
    return element.cloneNode();;
}

export default createDOMNode;