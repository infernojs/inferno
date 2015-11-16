import domElementsTestsFunctional from './functional-api/dom-elements-tests-functional.js';
import domElementsTestsJsx from './inferno-jsx/dom-elements-tests-jsx.js';
import Inferno from '../../../src';

export default function domElementsTests(describe, expect) {
    describe('DOM elements tests', () => {
        let container = document.createElement('div');

        beforeEach(() => {
            container.innerHTML = '';
        });

        afterEach(() => {
            Inferno.clearDomElement(container);
        });

        describe('using the Inferno functional API', () => {
            domElementsTestsFunctional(describe, expect, container);
        });

        describe('using the Inferno JSX plugin', () => {
            domElementsTestsJsx(describe, expect, container);
        });
    });

}
