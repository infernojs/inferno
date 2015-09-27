import svgCfg from './cfg/svgCfg';
import svgNamespace from './vars/svgNamespace';
import mathNamespace from './vars/mathNamespace';

function createElementWithIs(tag, xmlns, is) {

    switch (tag) {
        case "a":
            return document.createElement('a', is);
        case 'body':
            return document.createElement('body', is);
        case 'br':
            return document.createElement('br', is);
        case 'button':
            return document.createElement('button', is);
        case 'circle':
            return document.createElementNS(svgNamespace, 'circle', is);
        case 'div':
            return document.createElement('div', is);
        case 'em':
            return document.createElement('em', is);
        case 'form':
            return document.createElement('form', is);
        case 'href':
            return document.createElement('href', is);
        case 'img':
            return document.createElement('img', is);
        case 'option':
            return document.createElement('option', is);
        case 'li':
            return document.createElement('li', is);
        case 'ol':
            return document.createElement('ol', is);
        case 'rec':
            return document.createElementNS(svgNamespace, 'rec', is);
        case 'select':
            return document.createElement('select', is);
        case 'span':
            return document.createElement('span', is);
        case 'style':
            return document.createElement('style', is);
        case 'table':
            return document.createElement('table', is);
        case 'ul':
            return document.createElement('ul', is);
        case 'elipse':
            return document.createElementNS(svgNamespace, 'elipse', is);
        default:

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

            return document.createElement(tag, is);
    }
}

export default createElementWithIs;