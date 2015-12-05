import domElementsTestsNoJSX from './no-jsx/dom-elements-tests.js';
//import domComponentsTestsFunctional from './functional-api/dom-components-tests-functional.js';
//import domElementsTestsJsx from './inferno-jsx/dom-elements-tests-jsx.js';
//import domComponentsTestsJsx from './inferno-jsx/dom-components-tests-jsx.js';
import Inferno from '../../../src';

export default function domElementsTests(describe, expect) {
    describe('DOM elements tests', () => {
        let container = document.createElement('div');

        beforeEach(() => {
            container.innerHTML = '';
        });
        afterEach(() => {
            Inferno.render(null, container);
        });

        describe('using the Inferno functional API', () => {
			describe('HTML', () => {
                domElementsTestsNoJSX(describe, expect, container);
				//domElementsTestsFunctional(describe, expect, container);
			});
			describe('Components', () => {
				//domComponentsTestsFunctional(describe, expect, container);
			})
        });
        describe('using the Inferno JSX plugin', () => {
			describe('HTML', () => {
				//domElementsTestsJsx(describe, expect, container);
			});
			describe('Components', () => {
				//domComponentsTestsJsx(describe, expect, container);
			});
        });
    });

}
