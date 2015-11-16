import addAttributes from '../addAttributes';
import extendUnitlessNumber from '../extendUnitlessNumber';
import addProps               from '../addProps';
import createElementWithoutIs from '../createElementWithoutIs';
import createElementWithIs from '../createElementWithIs';

export default {
    addAttributes,
    addProps,
    extendUnitlessNumber,
    createElement: (tag, xmlns, is) => is ? createElementWithIs(tag, xmlns, is) : createElementWithoutIs(tag, xmlns),
    createTextNode: text => document.createTextNode(text),
    createEmptyText: () => document.createTextNode('')
};
