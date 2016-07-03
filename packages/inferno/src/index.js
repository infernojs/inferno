import { createBlueprint, createVNode, createVText }from '../../../src/core/shapes';
import { createUniversalElement } from '../../../src/core/universal';

export default {
	createBlueprint,
	createVNode,
	createVText,
	universal: {
		createElement: createUniversalElement
	}
};
