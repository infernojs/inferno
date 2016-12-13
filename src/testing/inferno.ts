import {
	createVNode
} from '../core/shapes';
import cloneVNode from '../factories/cloneVNode';
import {
	render,
	createRenderer,
	enableFindDOMNode,
	findDOMNode
} from '../DOM/rendering';
import {
	disableRecycling
} from '../DOM/recycling';
import {
	EMPTY_OBJ,
	NO_OP
} from '../shared';
import linkEvent from '../DOM/events/linkEvent';

export {
	createVNode,
	cloneVNode,
	render,
	createRenderer,
	EMPTY_OBJ,
	NO_OP,
	linkEvent,
	enableFindDOMNode,
	findDOMNode,
	disableRecycling
};

export default {
	createVNode,
	cloneVNode,
	render,
	createRenderer,
	EMPTY_OBJ,
	NO_OP,
	linkEvent,
	enableFindDOMNode,
	findDOMNode,
	disableRecycling
};
