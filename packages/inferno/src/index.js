import {
	createVNode
} from '../../../src/core/shapes';
import cloneVNode from '../../../src/factories/cloneVNode';
import { warning, NO_OP, isBrowser } from '../../../src/shared';
import { render, findDOMNode, createRenderer } from '../../../src/DOM/rendering';
import { disableRecycling } from '../../../src/DOM/recycling';
// import { initDevToolsHooks }  from '../../../src/DOM/devtools';

if (isBrowser) {
	window.process = {
		env: {
			NODE_ENV: 'development'
		}
	};
	// initDevToolsHooks(window);
}

if (process.env.NODE_ENV !== 'production') {
	const testFunc = function testFn() {};
	warning(
		(testFunc.name || testFunc.toString()).indexOf('testFn') !== -1,
		'It looks like you\'re using a minified copy of the development build ' +
		'of Inferno. When deploying Inferno apps to production, make sure to use ' +
		'the production build which skips development warnings and is faster. ' +
		'See http://infernojs.org for more details.'
	);
}

export default {
	// core shapes
	createVNode,

	// cloning
	cloneVNode,

	// TODO do we still need this? can we remove?
	NO_OP,

	//DOM
	render,
	findDOMNode,
	createRenderer,
	disableRecycling
};
