import svgCfg from './cfg/svgCfg';
import svgNamespace from './vars/svgNamespace';
import mathNamespace from './vars/mathNamespace';

function createElementWithoutIs(tag, xmlns) {

    switch (tag) {
        case "a":
            return document.createElement('a');
        case 'button':
            return document.createElement('button');
        case 'div':
            return document.createElement('div');
        case 'em':
            return document.createElement('em', is);
        case 'form':
            return document.createElement('form');
        case 'img':
            return document.createElement('img');
        case 'h1':
            return document.createElement('h1', is);
        case 'h2':
            return document.createElement('h2', is);
        case 'li':
            return document.createElement('li');
        case 'ol':
            return document.createElement('ol');
        case 'p':
            return document.createElement('p');
        case 'span':
            return document.createElement('span');
        case 'table':
            return document.createElement('table');
        case 'ul':
            return document.createElement('ul');
        case 'svg':
            return document.createElementNS(svgNamespace, 'svg');
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