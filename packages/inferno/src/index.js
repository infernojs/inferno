import {
	createVNode
} from '../../../build/core/shapes';
import cloneVNode from '../../../build/factories/cloneVNode';
import { warning, NO_OP, isBrowser, EMPTY_OBJ } from '../../../build/shared';
import { render, findDOMNode, createRenderer, enableFindDOMNode } from '../../../build/DOM/rendering';
import { disableRecycling } from '../../../build/DOM/recycling';
import { initDevToolsHooks } from '../../../build/DOM/devtools';
import linkEvent from '../../../build/DOM/events/linkEvent';

if (isBrowser) {
	window.process = {
		env: {
			NODE_ENV: 'development'
		}
	};
	initDevToolsHooks(window);
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
	linkEvent,
	// core shapes
	createVNode,

	// cloning
	cloneVNode,

	// used to shared common items between Inferno libs
	NO_OP,
	EMPTY_OBJ,

	//DOM
	render,
	findDOMNode,
	createRenderer,
	disableRecycling,
	enableFindDOMNode
};
