import svgCfg from './cfg/svgCfg';
import svgNamespace from './vars/svgNamespace';
import mathNamespace from './vars/mathNamespace';

function createElementWithoutIs(tag, xmlns) {

    switch (tag) {
        case "a":
            return document.createElement('a');
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
        case 'em':
            return document.createElement('em', is);
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
                return document.createElementNS(xmlns, tag);
            }

            // mathML namespace
            if (tag === 'math') {
                return document.createElementNS(mathNamespace, tag);
            }

            // SVG elements supported by Inferno
            if (svgCfg[tag]) {
                return document.createElementNS(svgNamespace, tag);
            }

            return document.createElement(tag);
    }
}

export default createElementWithoutIs;