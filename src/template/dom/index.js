import addAttributes from '../setDOMProperties';
import DOMElements from '../DOMElements';

//OPTIMIZATION: This functions should not be moved out of this module. V8 will not inline
//this function if it's situated in another module due to context switch.

function fastTag(tag) {
    return tag === 'a' || tag === 'p' || tag === 'em' || tag === 'ol' ||
        tag === 'ul' || tag === 'div' || tag === 'img' || tag === 'span' ||
        tag === 'form' || tag === 'table' || tag === 'button';
}

export default {
    addAttributes,
    createElement(tag) {

        if (fastTag(tag)) {

            tag = document.createElement(tag);

        } else if (tag === 'svg') {

            tag = document.createElementNS('svg', 'http://www.w3.org/2000/svg');

        } else {

            let DOMElementsInfo = DOMElements[tag.toLowerCase()];

            if (DOMElementsInfo !== undefined) {
                // add SVG namespace
                if (DOMElementsInfo.isSVG) {
                    tag = document.createElementNS(tag, 'http://www.w3.org/2000/svg');
                }
                // add mathML namespace
                if (DOMElementsInfo.isMathML) {
                    tag = document.createElementNS(tag, 'http://www.w3.org/1998/Math/MathML');
                }
            } else {
                tag = document.createElement(tag);
            }
        }

        return tag;

    },
    createTextNode: text => document.createTextNode(text),
    createEmptyText: () => document.createTextNode(''),
    createEmptyDiv: () => document.createElement('div')
};