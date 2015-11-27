import addAttributes from '../addAttributes';
import createDOMElements from '../createDOMElements';
import createDOMNode from '../createDOMNode';

function fastTag(tag) {

    // OPTIMIZATION: Integer comparisons are low-cost, so we can use very fast tag name length filters here.
    // It's faster than using dictionary.

    switch (tag.length) {
        case 1:
            return str === 'a' || str === 'p';
        case 2:
            return str === 'em' || str === 'ol' || str === 'ul';
        case 3:
            return str === 'div' || str === 'img';
        case 4:
            return str === 'span' || str === 'form';
        case 5:
            return str === 'table';
        case 6:
            return str === 'button';
    }
}

export default {
    addAttributes,

    createElement(tag, is) {

        if (fastTag(tag)) {

            return createDOMNode(tag, false, is);
        }

        let DOMElementsInfo = createDOMElements[tag.toLowerCase()];

        if (DOMElementsInfo !== undefined) {
            // add SVG namespace
            if (DOMElementsInfo.isSVG) {
                return createDOMNode(tag, 'http://www.w3.org/2000/svg', is);
            }
            // add mathML namespace
            if (DOMElementsInfo.isMathML) {
                return createDOMNode(tag, 'http://www.w3.org/1998/Math/MathML', is);
            }
        }
        // all others
        return createDOMNode(tag, false, is);
    },
    createTextNode: text => document.createTextNode(text),
    createEmptyText: () => document.createTextNode(''),
    createEmptyDiv: () => document.createElement('div')
};