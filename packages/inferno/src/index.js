import {
	createVNode,
	cloneVNode
} from '../../../build/core/VNodes';
import { warning, NO_OP, EMPTY_OBJ } from '../../../build/shared';
import { render, findDOMNode, createRenderer } from '../../../build/DOM/rendering';
import linkEvent from '../../../build/DOM/events/linkEvent';
import options from '../../../build/core/options';

if (process.env.NODE_ENV !== 'production') {
	Object.freeze(EMPTY_OBJ);
	const testFunc = function testFn() {};
	warning(
		(testFunc.name || testFunc.toString()).indexOf('testFn') !== -1,
		'It looks like you\'re using a minified copy of the development build ' +
		'of Inferno. When deploying Inferno apps to production, make sure to use ' +
		'the production build which skips development warnings and is faster. ' +
		'See http://infernojs.org for more details.'
	);
}

// we duplicate it so it plays nicely with different module loading systems
export default {
	linkEvent,
	// core shapes
	createVNode,

	// cloning
	cloneVNode,

	// used to shared common items between Inferno libs
	NO_OP,
	EMPTY_OBJ,

	// DOM
	render,
	findDOMNode,
	createRenderer,
	options
};

export {
	linkEvent,
	// core shapes
	createVNode,

	// cloning
	cloneVNode,

	// used to shared common items between Inferno libs
	NO_OP,
	EMPTY_OBJ,

	// DOM
	render,
	findDOMNode,
	createRenderer,
	options
};
