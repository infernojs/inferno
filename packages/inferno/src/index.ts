import { warning, NO_OP, EMPTY_OBJ } from 'inferno-helpers';
import { Props, VNode, createVNode, cloneVNode, InfernoChildren } from './core/VNodes';
import linkEvent from './DOM/events/linkEvent';
import options from './core/options';
import { render, findDOMNode, createRenderer } from './DOM/rendering';
import VNodeFlags from 'inferno-vnode-flags';

if (process.env.NODE_ENV !== 'production') {
	const testFunc = function testFn() {};
	if ((testFunc.name || testFunc.toString()).indexOf('testFn') === -1) {
		warning(('It looks like you\'re using a minified copy of the development build ' +
				'of Inferno. When deploying Inferno apps to production, make sure to use ' +
				'the production build which skips development warnings and is faster. ' +
				'See http://infernojs.org for more details.'
		));
	}
}

// This will be replaced by rollup
export const version = 'VERSION';

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
	options,
	version
};

export {
	// Interfaces
	Props,
	VNode,
	InfernoChildren,
	VNodeFlags,

	// Public methods
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

// Internal stuff that only core inferno-* packages use
export { isUnitlessNumber as internal_isUnitlessNumber } from './DOM/constants';
