import addAttributes from '../addAttributes';
import createDOMElements from '../createDOMElements';

export default {
    addAttributes,
    createElement(tag, is) {

            switch (tag) {
                case 'div':
                case 'span':
                case 'button':
                case 'em':
                case 'form':
                case 'img':
                case 'a':
                case 'ol':
                case 'p':
                case 'table':
                case 'ul':
                case 'ol':
                case 'p':

                    return is ?
                        document.createElement(tag, is) :
                        document.createElement(tag);
                default:

                    let DOMElementsInfo = createDOMElements[tag.toLowerCase()];

                    if (DOMElementsInfo !== undefined) {
                        if (DOMElementsInfo.isSVG) {
                            // add SVG namespace
                            return is ?
                                document.createElementNS('http://www.w3.org/2000/svg', tag, is) :
                                document.createElementNS('http://www.w3.org/2000/svg', tag);
                        }
                        if (DOMElementsInfo.isMathML) {
                            // add mathML namespace
                            return is ?
                                document.createElementNS('http://www.w3.org/1998/Math/MathML', tag, is) :
                                document.createElementNS('http://www.w3.org/1998/Math/MathML', tag);
                        }
                    }
                    // all others
                    return is ?
                        document.createElement(tag, is) :
                        document.createElement(tag);
            }
        },
        createTextNode: text => document.createTextNode(text),
        createEmptyText: () => document.createTextNode(''),
        createEmptyDiv: () => document.createElement('div')
};