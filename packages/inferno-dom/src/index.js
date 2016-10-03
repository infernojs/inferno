import { render, findDOMNode, createRenderer, roots } from '../../../src/DOM/rendering';
import createStaticVElementClone from '../../../src/factories/createStaticVElementClone';
import { disableRecycling } from '../../../src/DOM/recycling';

if (typeof window !== 'undefined' && window.document) {
	// WIP – no idea what I'm doing really?
	window.__INFERNO_DEVTOOLS_DOM_ROOTS__ = roots;
	
	window.addEventListener('inferno.devtools.init', function (event) {
		debugger;
	});
}

export default {
	render,
	findDOMNode,
	createRenderer,
	createStaticVElementClone,
	disableRecycling
};
