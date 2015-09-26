import svgCfg               from './cfg/svgCfg';
import addAttributes        from './addAttributes';
import extendUnitlessNumber from './extendUnitlessNumber';
import AttributeOps         from './AttributeOps';

export default {
    addAttributes,
    extendUnitlessNumber,
    AttributeOps,
    createElement: (tag, xmlns, is, parent) => {

            let element, namespace;

            if ( xmlns ) {
                element = document.createElementNS("http://www.w3.org/2000/svg", tag, is);
			} if (svgCfg[tag]) {
               element = document.createElementNS("http://www.w3.org/2000/svg", tag, is);
            } else if ( tag === 'math') {
				element = document.createElementNS('http://www.w3.org/1998/Math/MathML', tag);
			} else {
                    element = document.createElement(tag);
            }

            return element;

        },
        createTextNode: text => document.createTextNode(text),
        createEmptyText: () => document.createTextNode('')
};