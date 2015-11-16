import elementsTestsFunctional from './functional-api/elements-tests-functional';
import elementsTestsJsx from './inferno-jsx/elements-tests-jsx';

export default function elementsTests(describe, expect) {
    describe('DOM elements tests', () => {
        describe('using the Inferno functional API', () => {
            elementsTestsFunctional(describe, expect);
        });
        describe('using the Inferno JSX plugin', () => {
            elementsTestsJsx(describe, expect);
        });
    });
}
