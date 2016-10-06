import { render, findDOMNode, createRenderer } from '../../../src/DOM/rendering';
import createStaticVElementClone from '../../../src/factories/createStaticVElementClone';
import { disableRecycling } from '../../../src/DOM/recycling';
import { initDevToolsHooks, exitDevToolsHooks }  from '../../../src/DOM/devtools';

if (typeof window !== 'undefined' && window.document) {
	initDevToolsHooks(window);
}

export default {
	render,
	findDOMNode,
	createRenderer,
	createStaticVElementClone,
	disableRecycling
};
