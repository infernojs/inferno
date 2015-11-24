import addAttributes from '../addAttributes';
import createDOMElements from '../createDOMElements';
import createDOMNode from '../createDOMNode';

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

				return createDOMNode(tag, false, is);
				
                default:

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
            }
        },
        createTextNode: text => document.createTextNode(text),
        createEmptyText: () => document.createTextNode(''),
        createEmptyDiv: () => document.createElement('div')
};