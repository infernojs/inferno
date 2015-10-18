import svgCfg from     './cfg/svgCfg';
import namespaces from './vars/namespaces';

export default {

    createElement(tag, xmlns) {

        switch (tag) {

            // NOTE! This is not in a alphabetic order, but after frequently used
            // events

            case 'div':
                return document.createElement('div');
            case 'span':
                return document.createElement('span');
            case 'a':
                return document.createElement('a');
            case 'li':
                return document.createElement('li');
            case 'ol':
                return document.createElement('ol');
            case 'svg':
                return document.createElementNS(namespaces.svg, 'svg');
            case 'button':
                return document.createElement('button');
            case 'em':
                return document.createElement('em');
            case 'form':
                return document.createElement('form');
            case 'img':
                return document.createElement('img');
            case 'h1':
                return document.createElement('h1');
            case 'h2':
                return document.createElement('h2');
            case 'p':
                return document.createElement('p');
            case 'table':
                return document.createElement('table');
            case 'ul':
                return document.createElement('ul');
            default:
                return xmlns ? document.createElementNS(xmlns, tag) :
                    tag === 'math' ? document.createElementNS(namespaces.math, tag) :
                    svgCfg[tag] ? document.createElementNS(namespaces.svg, tag) :
                    document.createElement(tag);
        }
    }
};