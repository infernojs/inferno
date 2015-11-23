import Inferno from '../src';
import { expect } from 'chai';

//acceptance render test group
//import renderSvgTests from './acceptance/render/svg-tests';
//import renderMathMlTests from './acceptance/render/math-ml-tests';
import renderDomElementsTests from './acceptance/render/dom-elements-tests';

//acceptance renderToString test group
import renderToStringElementsTests from './acceptance/renderToString/elements-tests';

// DOM event tests
import domEventTests from './acceptance/dom-events-tests';

//acceptance operation tests
import domOperationTests from './acceptance/dom-operation-tests';
//import cssOperationTests from './acceptance/css-operation-tests';

//performance render test group
import renderVdomBenchTests from './performance/render/vdom-bench-tests';

describe('Inferno acceptance tests', () => {
//	describe('Inferno.render()', () => {
//		renderSvgTests(describe, expect);
//		renderMathMlTests(describe, expect);
		renderDomElementsTests(describe, expect);
//	});

	describe('Inferno.renderToString()', () => {
//		renderToStringElementsTests(describe, expect);
	});

	domEventTests(describe, expect);
	//cssOperationTests(describe, expect);
	domOperationTests(describe, expect);
});

describe('Inferno performance tests', () => {
	describe('Inferno.render()', () => {
		renderVdomBenchTests(describe, expect);
	});
});
