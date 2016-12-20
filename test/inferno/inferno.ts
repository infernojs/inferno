import {
	createVNode,
	cloneVNode
} from '../../src/core/VNodes';
import {
	render,
	createRenderer,
	enableFindDOMNode,
	findDOMNode
} from '../../src/DOM/rendering';
import {
	disableRecycling
} from '../../src/DOM/recycling';
import {
	EMPTY_OBJ,
	NO_OP
} from '../../src/shared';
import linkEvent from '../../src/DOM/events/linkEvent';

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
