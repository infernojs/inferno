import svgCfg from './cfg/svgCfg';
import svgNamespace from './vars/svgNamespace';
import mathNamespace from './vars/mathNamespace';

function createElementWithIs(tag, xmlns, is) {

    switch (tag) {
        case 'a':
            return document.createElement('a', is);
        case 'button':
            return document.createElement('button', is);
        case 'div':
            return document.createElement('div', is);
        case 'em':
            return document.createElement('em', is);
        case 'form':
            return document.createElement('form', is);
        case 'img':
            return document.createElement('img', is);
        case 'h1':
            return document.createElement('h1', is);
        case 'h2':
            return document.createElement('h2', is);
        case 'li':
            return document.createElement('li', is);
        case 'ol':
            return document.createElement('ol', is);
        case 'p':
            return document.createElement('p', is);
        case 'span':
            return document.createElement('span', is);
        case 'table':
            return document.createElement('table', is);
        case 'ul':
            return document.createElement('ul', is);
        case 'svg':
            return document.createElementNS(svgNamespace, 'svg', is);
        default:

            return xmlns ? document.createElementNS(xmlns, tag, is) :
                tag === 'math' ? document.createElementNS(mathNamespace, tag, is) :
                svgCfg[tag] ? document.createElementNS(svgNamespace, tag, is) :
                document.createElement(tag, is);
    }
}

export default createElementWithIs;