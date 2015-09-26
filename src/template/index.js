import svgCfg               from './cfg/svgCfg';
import addAttributes        from './addAttributes';
import extendUnitlessNumber from './extendUnitlessNumber';
import AttributeOps         from './AttributeOps';

let svgNamespace = 'http://www.w3.org/2000/svg';
let mathNamespace = 'http://www.w3.org/1998/Math/MathML';

export default {
    addAttributes,
    extendUnitlessNumber,
    AttributeOps,
    createElement: (tag, xmlns, is) => {

            let element;

            // div, span, img, href
            if (tag === 'div' ||
                tag === 'span' ||
                tag === 'img' ||
                tag === 'href') {

                return document.createElement(tag);
            }
            
			// provided namespace given by the end-devs
            if (xmlns) {
                return document.createElementNS(xmlns, tag, is);
            }
            
			// mathML namespace
            if (tag === 'math') {
                return document.createElementNS(mathNamespace, tag, is);
            }
            
			// SVG elements supported by Inferno
            if (svgCfg[tag]) {
                return document.createElementNS(svgNamespace, tag, is);
            }

            return document.createElement(tag);

        },
        createTextNode: text => document.createTextNode(text),
        createEmptyText: () => document.createTextNode('')
};