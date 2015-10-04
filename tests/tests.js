/** @jsx t */
/* global describe it beforeEach afterEach */
import Inferno from '../src';
import { expect } from 'chai';

//render test group
import renderSvgTests from './groups/render/svg-tests';
import renderMathMlTests from './groups/render/math-ml-tests';
import renderDomElementsTests from './groups/render/dom-elements-tests';
import renderVirtualElementsTests from './groups/render/virtual-elements-tests';

//renderToString test group
import renderToStringDomElementsTests from './groups/renderToString/dom-elements-tests';
import renderToStringVirtualElementsTests from './groups/renderToString/virtual-elements-tests';

import domOperationTests from './groups/dom-operation-tests';
import cssOperationTests from './groups/css-operation-tests';

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
