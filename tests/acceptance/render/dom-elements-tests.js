import domElementsTestsNoJSX from './no-jsx/dom-elements-tests.js';
import domComponentsTestsNoJSX from './no-jsx/dom-components-tests.js';
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

        describe('using the Inferno with no JSX plugin', () => {
			describe('HTML', () => {
                domElementsTestsNoJSX(describe, expect, container);
			});
			describe('Components', () => {
				domComponentsTestsNoJSX(describe, expect, container);
			})
        });
        describe('using the Inferno with the JSX plugin', () => {
			describe('HTML', () => {
				//domElementsTestsJsx(describe, expect, container);
			});
			describe('Components', () => {
				//domComponentsTestsJsx(describe, expect, container);
			});
        });
    });

}
