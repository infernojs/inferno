import addAttributes from './addAttributes';
import extendUnitlessNumber from './extendUnitlessNumber';
import AttributeOps from './AttributeOps';
import createElementWithoutIs from './createElementWithoutIs';
import createElementWithIs from './createElementWithIs';

export default {
    addAttributes,
    extendUnitlessNumber,
    AttributeOps,
    createElement: (tag, xmlns, is) => is ? createElementWithIs(tag, xmlns, is) : createElementWithoutIs(tag, xmlns),
    createTextNode: text => document.createTextNode(text),
    createEmptyText: () => document.createTextNode('')
};