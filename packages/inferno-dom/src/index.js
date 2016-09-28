import { render, findDOMNode, createRenderer, roots } from '../../../src/DOM/rendering';
import createStaticVElementClone from '../../../src/factories/createStaticVElementClone';
import { disableRecycling } from '../../../src/DOM/recycling';

if (typeof window !== 'undefined' && window.document) {
	window.__INFERNO_DEVTOOLS_DOM_ROOTS__ = roots;
}

export default {
	render,
	findDOMNode,
	createRenderer,
	createStaticVElementClone,
	disableRecycling
};
