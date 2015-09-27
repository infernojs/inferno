import addAttributes from './addAttributes';
import extendUnitlessNumber from './extendUnitlessNumber';
import AttributeOps from './AttributeOps';
import createElementWithoutIs from './createElementWithoutIs';
import createElementWithIs from './createElementWithIs';

export default {
    addAttributes,
    extendUnitlessNumber,
    AttributeOps,
    createElement: (tag, xmlns, is) => {

            if (is) {

                createElementWithIs(tag, xmlns, is);

            } else {

               return createElementWithoutIs(tag, xmlns);
            }
        },
        createTextNode: text => document.createTextNode(text),
        createEmptyText: () => document.createTextNode('')
};