import addAttributes        from './addAttributes';
import extendUnitlessNumber from './extendUnitlessNumber';
import AttributeOps        from './AttributeOps';

export default {
    addAttributes,
    extendUnitlessNumber,
    AttributeOps,
    createElement: (tag, parent) => {

            let namespace;

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

           return (namespace === undefined) ? document.createElement(tag) : document.createElementNS(namespace, tag);
        },
        createTextNode: text => document.createTextNode(text),
        createEmptyText: () => document.createTextNode('')
};