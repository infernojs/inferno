import Inferno from '../src';
import { expect } from 'chai';

//acceptance render test group
//import renderSvgTests from './acceptance/render/svg-tests';
//import renderMathMlTests from './acceptance/render/math-ml-tests';
import renderDomElementsTests from './acceptance/render/dom-elements-tests';
import renderVirtualElementsTests from './acceptance/render/virtual-elements-tests';

//acceptance renderToString test group
import renderToStringDomElementsTests from './acceptance/renderToString/dom-elements-tests';
import renderToStringVirtualElementsTests from './acceptance/renderToString/virtual-elements-tests';

// DOM event tests
import domEventTests from './acceptance/dom-events-tests';

//acceptance operation tests
import domOperationTests from './acceptance/dom-operation-tests';
import cssOperationTests from './acceptance/css-operation-tests';

//performance render test group
import renderVdomBenchTests from './performance/render/vdom-bench-tests';

describe('Inferno acceptance tests', () => {
	describe('Inferno.render()', () => {
//		renderSvgTests(describe, expect);
	//	renderMathMlTests(describe, expect);
		renderDomElementsTests(describe, expect);
		renderVirtualElementsTests(describe, expect);
	});

	describe('Inferno.renderToString()', () => {
		renderToStringDomElementsTests(describe, expect);
		renderToStringVirtualElementsTests(describe, expect);
	});

	domEventTests(describe, expect);
	cssOperationTests(describe, expect);
	domOperationTests(describe, expect);
});

describe('Inferno performance tests', () => {
	describe('Inferno.render()', () => {
		renderVdomBenchTests(describe, expect);
	});
});
