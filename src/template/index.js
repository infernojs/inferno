import svgCfg from './cfg/svgCfg';
import addAttributes from './addAttributes';
import extendUnitlessNumber from './extendUnitlessNumber';
import AttributeOps from './AttributeOps';

let svgNamespace = 'http://www.w3.org/2000/svg';
let mathNamespace = 'http://www.w3.org/1998/Math/MathML';

export default {
    addAttributes,
    extendUnitlessNumber,
    AttributeOps,
    createElement: (tag, xmlns, is) => {

            switch (tag) {
                case "a":
                    return document.createElement('a');
                case "b":
                    return document.createElement('b');
                case 'body':
                    return document.createElement('body');
                case 'br':
                    return document.createElement('br');
                case 'button':
                    return document.createElement('button');
                case 'circle':
                    return document.createElementNS(svgNamespace, 'circle');
                case 'div':
                    return document.createElement('div');
                case 'form':
                    return document.createElement('form');
                case 'href':
                    return document.createElement('href');
                case 'img':
                    return document.createElement('img');
                case 'option':
                    return document.createElement('option');
                case 'li':
                    return document.createElement('li');
                case 'ol':
                    return document.createElement('ol');
                case 'rec':
                    return document.createElementNS(svgNamespace, 'rec');
                case 'select':
                    return document.createElement('select');
                case 'span':
                    return document.createElement('span');
                case 'style':
                    return document.createElement('style');
                case 'table':
                    return document.createElement('table');
                case 'ul':
                    return document.createElement('ul');
                case 'elipse':
                    return document.createElementNS(svgNamespace, 'elipse');
                default:
                    if (xmlns) {
                        return document.createElementNS(xmlns, tag, is);
                    }
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