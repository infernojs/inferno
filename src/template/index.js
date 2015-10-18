import addAttributes from './addAttributes';
import createElementWithoutIs from './createElementWithoutIs';
import createElementWithIs from './createElementWithIs';

export default {
    addAttributes,
    createElement: (tag, xmlns, is) => is ? createElementWithIs(tag, xmlns, is) : createElementWithoutIs(tag, xmlns),
    createTextNode: text => document.createTextNode(text),
    createEmptyText: () => document.createTextNode('')
};