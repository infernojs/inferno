import addAttributes        from './addAttributes';
import extendUnitlessNumber from './extendUnitlessNumber';
import AttributeOps         from './AttributeOps';

export default {
    addAttributes,
    extendUnitlessNumber,
    AttributeOps,
    createElement: (tag, xmlns, is, parent) => {

            let element, namespace;

                switch (tag) {
                    case 'svg':
                        namespace = "http://www.w3.org/2000/svg";
                        break;
                    case 'math':
                        namespace = "http://www.w3.org/1998/Math/MathML";
                        break;
                    default:
                        if (parent) {
                            namespace = parent.namespace;
                        }
                }

            if (namespace) { // xmlns, is...
                if (is) {
                    element = document.createElementNS(namespace, tag, is);
                } else {
                    element = document.createElementNS(namespace, tag);
                }
            } else {
                if (is) {
                    element = document.createElement(tag, is);
                } else {
                    element = document.createElement(tag);
                }
            }

            return element;

        },
        createTextNode: text => document.createTextNode(text),
        createEmptyText: () => document.createTextNode('')
};