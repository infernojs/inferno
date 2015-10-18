import addAttributes          from './addAttributes';
import setProperty            from './setProperty';
import setAttributes          from './setAttributes';
import createElementWithoutIs from './createElementWithoutIs';
import createElementWithIs    from './createElementWithIs';

export default {
    addAttributes,
	setProperty,
	setAttributes,
    createElement: (tag, xmlns, is) => is ? createElementWithIs(tag, xmlns, is) : createElementWithoutIs(tag, xmlns),
    createTextNode: text => document.createTextNode(text),
    createEmptyText: () => document.createTextNode('')
};