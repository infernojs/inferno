import options from '../../packages/inferno/src/core/options';
import {
	cloneVNode,
	createVNode,
} from '../../packages/inferno/src/core/VNodes';
import linkEvent from '../../packages/inferno/src/events/linkEvent';
import {
	createRenderer,
	findDOMNode,
	render,
} from '../../packages/inferno/src/rendering';
import {
	EMPTY_OBJ,
	NO_OP,
} from '../../packages/inferno-helpers/src/index';

export {
	createVNode,
	cloneVNode,
	render,
	createRenderer,
	EMPTY_OBJ,
	NO_OP,
	linkEvent,
	options,
	findDOMNode
};

export default {
	createVNode,
	cloneVNode,
	render,
	createRenderer,
	EMPTY_OBJ,
	NO_OP,
	linkEvent,
	options,
	findDOMNode,
};
