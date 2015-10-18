import Inferno from '../src';
import { expect } from 'chai';

//acceptance render test group
import renderSvgTests from './acceptance/render/svg-tests';
import renderMathMlTests from './acceptance/render/math-ml-tests';
import renderDomElementsTests from './acceptance/render/dom-elements-tests';
import renderVirtualElementsTests from './acceptance/render/virtual-elements-tests';
import escapeTests from './acceptance/render/escape-tests';

//acceptance renderToString test group
import renderToStringDomElementsTests from './acceptance/renderToString/dom-elements-tests';
//import renderToStringVirtualElementsTests from './acceptance/renderToString/virtual-elements-tests';
import renderToStringTests from './acceptance/renderToString/renderToString-tests';

//performance render test group
import renderVdomBenchTests from './performance/render/vdom-bench-tests';

describe('Inferno acceptance tests', () => {
	describe('Inferno.render()', () => {
		renderSvgTests(describe, expect, Inferno);
		renderMathMlTests(describe, expect, Inferno);
		renderDomElementsTests(describe, expect, Inferno);
		renderVirtualElementsTests(describe, expect, Inferno);
	});
	describe('Escape HTML content, and attributes', () => {
         escapeTests(describe, expect, Inferno);
	});


	describe('Inferno.renderToString()', () => {
		renderToStringDomElementsTests(describe, expect, Inferno);
//		renderToStringVirtualElementsTests(describe, expect, Inferno);
		renderToStringTests(describe, expect, Inferno);
	});

//	domEventTests(describe, expect, Inferno);
//	cssOperationTests(describe, expect, Inferno);
//	domOperationTests(describe, expect, Inferno);
});

describe('Inferno performance tests', () => {
	describe('Inferno.render()', () => {
		renderVdomBenchTests(describe, expect, Inferno);
	});
});
