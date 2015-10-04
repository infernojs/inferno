/** @jsx t */
/* global describe it beforeEach afterEach */
import Inferno from '../src';
import { expect } from 'chai';

//render test group
import renderSvgTests from './acceptance/render/svg-tests';
import renderMathMlTests from './acceptance/render/math-ml-tests';
import renderDomElementsTests from './acceptance/render/dom-elements-tests';
import renderVirtualElementsTests from './acceptance/render/virtual-elements-tests';

//renderToString test group
import renderToStringDomElementsTests from './acceptance/renderToString/dom-elements-tests';
import renderToStringVirtualElementsTests from './acceptance/renderToString/virtual-elements-tests';

import domOperationTests from './acceptance/dom-operation-tests';
import cssOperationTests from './acceptance/css-operation-tests';

describe('Inferno acceptance tests', () => {
	describe('Inferno.render()', () => {
		renderSvgTests(describe, expect, Inferno);
		renderMathMlTests(describe, expect, Inferno);
		renderDomElementsTests(describe, expect, Inferno);
		renderVirtualElementsTests(describe, expect, Inferno);
	});

	describe('Inferno.renderToString()', () => {
		renderToStringDomElementsTests(describe, expect, Inferno);
		renderToStringVirtualElementsTests(describe, expect, Inferno);
	});

	cssOperationTests(describe, expect, Inferno);
	domOperationTests(describe, expect, Inferno);
});
