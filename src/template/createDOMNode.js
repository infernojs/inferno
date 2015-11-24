
const doc = global.document;

function createDOMNode(tagName, namespace, typextension) {

    let element;

    if (namespace) {
        if (typextension) {

            element = doc.createElementNS(namespace, tagName, typextension);
        } else {

            element = doc.createElementNS(namespace, tagName);
        }
    } else {
        if (typextension) {

            element = doc.createElement(tagName, typextension);
        } else {
            element = doc.createElement(tagName);
        }
    }
    return element;
}

export default createDOMNode;